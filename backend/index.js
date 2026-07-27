require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { classifyBinImage, generateOptimizedRoute } = require('./agent');
const { processPredictiveLayer, calculateBinRisk } = require('./predictiveEngine');
const { mcpToolsRegistry, handleMcpToolCall } = require('./mcpServer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Serve static assets from built Vite dist folder in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Initial Mock In-Memory Database (mimics Firestore Realtime collections)
let binsStore = [
  {
    id: 'bin_indira_101',
    address: '100ft Road, Indiranagar, Bengaluru',
    location: { lat: 12.9716, lng: 77.6412 },
    capacity: '1100L Commercial Compactor',
    lastPickupDate: '2026-07-23T08:30:00Z', // 4 days ago
    status: 'overflowing',
    predictiveFlag: true,
    zone: 'Indiranagar'
  },
  {
    id: 'bin_kora_204',
    address: '5th Block, Koramangala (Opp. Forum)',
    location: { lat: 12.9352, lng: 77.6245 },
    capacity: '660L Standard Wheelie',
    lastPickupDate: '2026-07-22T10:00:00Z', // 5 days ago -> HIGH PREDICTIVE RISK!
    status: 'normal',
    predictiveFlag: false,
    zone: 'Koramangala'
  },
  {
    id: 'bin_mg_309',
    address: 'MG Road Metro Station Exit 2',
    location: { lat: 12.9756, lng: 77.6066 },
    capacity: '1100L Solar Smart Bin',
    lastPickupDate: '2026-07-21T14:15:00Z', // 6 days ago -> HIGH PREDICTIVE RISK!
    status: 'normal',
    predictiveFlag: false,
    zone: 'CBD / MG Road'
  },
  {
    id: 'bin_hsr_412',
    address: '27th Main Road, HSR Layout Sector 1',
    location: { lat: 12.9121, lng: 77.6445 },
    capacity: '660L Organic Bin',
    lastPickupDate: '2026-07-26T16:00:00Z', // Yesterday
    status: 'normal',
    predictiveFlag: false,
    zone: 'HSR Layout'
  },
  {
    id: 'bin_white_505',
    address: 'ITPL Main Road, Whitefield',
    location: { lat: 12.9870, lng: 77.7312 },
    capacity: '1100L Underground Drop',
    lastPickupDate: '2026-07-20T09:00:00Z', // 7 days ago -> ACTIVE OVERFLOW RISK!
    status: 'overflowing',
    predictiveFlag: true,
    zone: 'Whitefield'
  },
  {
    id: 'bin_jaya_618',
    address: '4th Block Shopping Complex, Jayanagar',
    location: { lat: 12.9298, lng: 77.5826 },
    capacity: '660L Standard Wheelie',
    lastPickupDate: '2026-07-27T07:00:00Z', // Today
    status: 'normal',
    predictiveFlag: false,
    zone: 'Jayanagar'
  }
];

let reportsStore = [
  {
    id: 'rep_1001',
    binId: 'bin_kora_204',
    userId: 'resident_88',
    userTrustScore: 92,
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop',
    geminiClassification: {
      isOverflowing: true,
      severity: 'high',
      confidenceScore: 0.96,
      wasteType: 'Cardboard & packaging waste',
      recommendation: 'Priority clearance required'
    },
    status: 'pending',
    reportedAt: '2026-07-25T11:20:00Z'
  },
  {
    id: 'rep_1002',
    binId: 'bin_kora_204',
    userId: 'resident_42',
    userTrustScore: 88,
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop',
    geminiClassification: {
      isOverflowing: true,
      severity: 'medium',
      confidenceScore: 0.91,
      wasteType: 'Mixed household plastic',
      recommendation: 'Dispatch within 4 hours'
    },
    status: 'pending',
    reportedAt: '2026-07-26T14:45:00Z'
  },
  {
    id: 'rep_1003',
    binId: 'bin_mg_309',
    userId: 'resident_19',
    userTrustScore: 95,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop',
    geminiClassification: {
      isOverflowing: true,
      severity: 'high',
      confidenceScore: 0.98,
      wasteType: 'Commercial debris & plastic',
      recommendation: 'Dispatch immediately'
    },
    status: 'pending',
    reportedAt: '2026-07-25T09:10:00Z'
  },
  {
    id: 'rep_1004',
    binId: 'bin_mg_309',
    userId: 'resident_77',
    userTrustScore: 84,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop',
    geminiClassification: {
      isOverflowing: true,
      severity: 'high',
      confidenceScore: 0.93,
      wasteType: 'Plastic food containers',
      recommendation: 'Immediate pickup'
    },
    status: 'pending',
    reportedAt: '2026-07-26T18:00:00Z'
  }
];

let routesStore = [];

/**
 * GET /api/bins
 * Returns list of all bins with predictive overflow scores evaluated live.
 */
app.get('/api/bins', (req, res) => {
  const evaluatedBins = processPredictiveLayer(binsStore, reportsStore);
  res.json({
    success: true,
    count: evaluatedBins.length,
    bins: evaluatedBins
  });
});

/**
 * POST /api/report
 * Citizen uploads bin photo for Gemini classification.
 */
app.post('/api/report', async (req, res) => {
  try {
    const { binId, imageBase64, location } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing photo data (imageBase64)' });
    }

    const targetBinId = binId || 'bin_indira_101';
    const classification = await classifyBinImage(imageBase64);
    
    const newReport = {
      id: `rep_${Date.now()}`,
      binId: targetBinId,
      userId: 'resident_demo',
      userTrustScore: 90,
      photoUrl: imageBase64.startsWith('http') ? imageBase64 : `data:image/jpeg;base64,${imageBase64.slice(0, 100)}...`,
      geminiClassification: classification,
      status: 'pending',
      reportedAt: new Date().toISOString()
    };

    reportsStore.unshift(newReport);

    // Update bin status if classified as overflowing
    const binIndex = binsStore.findIndex(b => b.id === targetBinId);
    if (binIndex !== -1 && classification.isOverflowing) {
      binsStore[binIndex].status = 'overflowing';
    }

    const updatedBins = processPredictiveLayer(binsStore, reportsStore);
    const updatedTargetBin = updatedBins.find(b => b.id === targetBinId);

    res.json({
      success: true,
      report: newReport,
      bin: updatedTargetBin,
      classification
    });
  } catch (error) {
    console.error("Report Endpoint Error:", error);
    res.status(500).json({ error: 'Failed to process citizen report' });
  }
});

/**
 * POST /api/bins/pickup
 * Logs a completed truck pickup for a bin, resetting its status.
 */
app.post('/api/bins/pickup', (req, res) => {
  const { binId } = req.body;
  const binIndex = binsStore.findIndex(b => b.id === binId);
  
  if (binIndex === -1) {
    return res.status(404).json({ error: 'Bin not found' });
  }

  binsStore[binIndex].status = 'normal';
  binsStore[binIndex].predictiveFlag = false;
  binsStore[binIndex].lastPickupDate = new Date().toISOString();

  // Clear pending reports for this bin
  reportsStore = reportsStore.filter(r => r.binId !== binId);

  const updatedBins = processPredictiveLayer(binsStore, reportsStore);
  res.json({
    success: true,
    message: `Pickup logged for ${binId}. Status reset to normal.`,
    bin: updatedBins.find(b => b.id === binId)
  });
});

/**
 * POST /api/generate-route
 * Priority nearest-neighbor ordering + Google Maps Directions API routing.
 */
app.post('/api/generate-route', async (req, res) => {
  try {
    const evaluatedBins = processPredictiveLayer(binsStore, reportsStore);
    const binsToPickup = evaluatedBins.filter(b => b.status === 'overflowing' || b.predictiveFlag);

    if (binsToPickup.length === 0) {
      return res.json({
        success: true,
        message: 'No bins currently require pickup. All bins within SLA.',
        route: null
      });
    }

    // BBMP Depot Start Location in Central Bengaluru
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

    routesStore.unshift(newRoute);

    res.json({
      success: true,
      route: newRoute
    });
  } catch (error) {
    console.error("Route Generation Error:", error);
    res.status(500).json({ success: false, error: true, errorType: 'SERVER_ERROR', errorMessage: error.message });
  }
});

/**
 * GET /api/mcp/tools
 * Exposes Model Context Protocol schema for hackathon judges & AI agents.
 */
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    protocolVersion: '1.0',
    serverName: 'Garbin-Municipal-MCP',
    tools: mcpToolsRegistry
  });
});

/**
 * POST /api/mcp/call
 * Handles JSON-RPC / MCP tool calls.
 */
app.post('/api/mcp/call', (req, res) => {
  const { tool, params } = req.body;
  const evaluatedBins = processPredictiveLayer(binsStore, reportsStore);
  
  const result = handleMcpToolCall(tool, params || {}, {
    bins: evaluatedBins,
    reports: reportsStore,
    routes: routesStore
  });

  res.json(result);
});

/**
 * GET /api/analytics
 * Returns summary stats for municipal staff dashboard.
 */
app.get('/api/analytics', (req, res) => {
  const evaluatedBins = processPredictiveLayer(binsStore, reportsStore);
  const totalBins = evaluatedBins.length;
  const overflowingCount = evaluatedBins.filter(b => b.status === 'overflowing').length;
  const highRiskCount = evaluatedBins.filter(b => b.predictiveFlag && b.status !== 'overflowing').length;
  const normalCount = totalBins - (overflowingCount + highRiskCount);

  res.json({
    success: true,
    metrics: {
      totalBins,
      overflowingCount,
      highRiskCount,
      normalCount,
      activeReports: reportsStore.length,
      averageCitizenTrustScore: 91,
      co2SavedThisWeekKg: 184.6,
      slaComplianceRate: '96.2%'
    }
  });
});

// Single Cloud Run service fallback: Serve built index.html for all client-side SPA routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Garbin backend listening on port ${PORT}`);
});
