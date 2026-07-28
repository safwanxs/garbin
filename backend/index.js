const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { classifyBinImage, generateOptimizedRoute } = require('./agent');
const { processPredictiveLayer } = require('./predictiveEngine');
const { mcpToolsRegistry, handleMcpToolCall } = require('./mcpServer');
const { db, requireFirebaseAuth } = require('./firebaseAdmin');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

function snapshotToRecords(snapshot) {
  return snapshot.docs.map((document) => ({ ...document.data(), id: document.id }));
}

async function getBins() {
  return snapshotToRecords(await db.collection('bins').get());
}

async function getReports() {
  const reports = snapshotToRecords(await db.collection('reports').get());
  return reports.sort((first, second) => new Date(second.reportedAt) - new Date(first.reportedAt));
}

async function getRoutes() {
  const routes = snapshotToRecords(await db.collection('routes').get());
  return routes.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

async function getEvaluatedBins() {
  const [bins, reports] = await Promise.all([getBins(), getReports()]);
  return { bins: processPredictiveLayer(bins, reports), reports };
}

async function deleteReportsForBin(binId) {
  const snapshot = await db.collection('reports').where('binId', '==', binId).get();
  const documents = [...snapshot.docs];

  while (documents.length) {
    const batch = db.batch();
    documents.splice(0, 500).forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}

app.get('/api/bins', async (req, res) => {
  try {
    const { bins } = await getEvaluatedBins();
    res.json({ success: true, count: bins.length, bins });
  } catch (error) {
    console.error('Bins Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to load bins from Firestore' });
  }
});

app.post('/api/report', requireFirebaseAuth, async (req, res) => {
  try {
    const { binId, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing photo data (imageBase64)' });
    }

    const targetBinId = binId || 'bin_indira_101';
    const classification = await classifyBinImage(imageBase64);
    const newReport = {
      id: `rep_${Date.now()}`,
      binId: targetBinId,
      userId: req.firebaseUser.uid,
      userTrustScore: 90,
      photoUrl: imageBase64.startsWith('http') ? imageBase64 : `data:image/jpeg;base64,${imageBase64.slice(0, 100)}...`,
      geminiClassification: classification,
      status: 'pending',
      reportedAt: new Date().toISOString()
    };

    const batch = db.batch();
    batch.set(db.collection('reports').doc(newReport.id), newReport);

    const binReference = db.collection('bins').doc(targetBinId);
    const binSnapshot = await binReference.get();
    if (binSnapshot.exists && classification.isOverflowing) {
      batch.update(binReference, { status: 'overflowing' });
    }
    await batch.commit();

    const { bins } = await getEvaluatedBins();
    res.json({
      success: true,
      report: newReport,
      bin: bins.find((bin) => bin.id === targetBinId),
      classification
    });
  } catch (error) {
    console.error('Report Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to process citizen report' });
  }
});

app.post('/api/bins/pickup', requireFirebaseAuth, async (req, res) => {
  try {
    const { binId } = req.body;
    const binReference = db.collection('bins').doc(binId);
    const binSnapshot = await binReference.get();

    if (!binSnapshot.exists) {
      return res.status(404).json({ error: 'Bin not found' });
    }

    await binReference.update({
      status: 'normal',
      predictiveFlag: false,
      lastPickupDate: new Date().toISOString()
    });
    await deleteReportsForBin(binId);

    const { bins } = await getEvaluatedBins();
    res.json({
      success: true,
      message: `Pickup logged for ${binId}. Status reset to normal.`,
      bin: bins.find((bin) => bin.id === binId)
    });
  } catch (error) {
    console.error('Pickup Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to log pickup' });
  }
});

app.post('/api/generate-route', requireFirebaseAuth, async (req, res) => {
  try {
    const { bins } = await getEvaluatedBins();
    const binsToPickup = bins.filter((bin) => bin.status === 'overflowing' || bin.predictiveFlag);

    if (binsToPickup.length === 0) {
      return res.json({
        success: true,
        message: 'No bins currently require pickup. All bins within SLA.',
        route: null
      });
    }

    const truckLocation = { lat: 12.9600, lng: 77.6300 };
    const routePlan = await generateOptimizedRoute(binsToPickup, truckLocation);

    if (!routePlan.success) {
      return res.status(400).json({
        success: false,
        error: true,
        errorType: routePlan.errorType,
        errorMessage: routePlan.errorMessage
      });
    }

    const newRoute = {
      ...routePlan.route,
      createdAt: new Date().toISOString(),
      status: 'assigned'
    };
    await db.collection('routes').doc(newRoute.routeId).set(newRoute);

    res.json({ success: true, route: newRoute });
  } catch (error) {
    console.error('Route Generation Error:', error);
    res.status(500).json({ success: false, error: true, errorType: 'SERVER_ERROR', errorMessage: error.message });
  }
});

app.get('/api/mcp/tools', (req, res) => {
  res.json({
    protocolVersion: '1.0',
    serverName: 'Garbin-Municipal-MCP',
    tools: mcpToolsRegistry
  });
});

app.post('/api/mcp/call', async (req, res) => {
  try {
    const { tool, params } = req.body;
    const [evaluated, routes] = await Promise.all([getEvaluatedBins(), getRoutes()]);
    const result = handleMcpToolCall(tool, params || {}, {
      bins: evaluated.bins,
      reports: evaluated.reports,
      routes
    });
    res.json(result);
  } catch (error) {
    console.error('MCP Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to load Firestore data for MCP tool call' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { bins, reports } = await getEvaluatedBins();
    const totalBins = bins.length;
    const overflowingCount = bins.filter((bin) => bin.status === 'overflowing').length;
    const highRiskCount = bins.filter((bin) => bin.predictiveFlag && bin.status !== 'overflowing').length;
    const normalCount = totalBins - (overflowingCount + highRiskCount);

    res.json({
      success: true,
      metrics: {
        totalBins,
        overflowingCount,
        highRiskCount,
        normalCount,
        activeReports: reports.length,
        averageCitizenTrustScore: 91,
        co2SavedThisWeekKg: 184.6,
        slaComplianceRate: '96.2%'
      }
    });
  } catch (error) {
    console.error('Analytics Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to load analytics from Firestore' });
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Garbin backend listening on port ${PORT}`);
});
