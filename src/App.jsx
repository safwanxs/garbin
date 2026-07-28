import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Camera, 
  Truck, 
  BarChart3, 
  Cpu, 
  Sparkles, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ReportBin from './components/ReportBin';
import RoutePlanner from './components/RoutePlanner';
import McpInspector from './components/McpInspector';
import Analytics from './components/Analytics';
import SubmissionKit from './components/SubmissionKit';
import { API_BASE } from './config';
import { ensureAnonymousAuth, getFirebaseAuthHeaders } from './firebase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bins, setBins] = useState([]);
  const [route, setRoute] = useState(null);
  const [loadingBins, setLoadingBins] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchBins = async () => {
    setLoadingBins(true);
    try {
      const res = await fetch(`${API_BASE}/bins`);
      const data = await res.json();
      if (data.success) {
        setBins(data.bins);
      }
    } catch (err) {
      console.error('Could not load Firestore-backed bin data:', err);
      setBins([]);
    } finally {
      setLoadingBins(false);
    }
  };

  useEffect(() => {
    ensureAnonymousAuth().catch((error) => {
      console.error('Firebase anonymous sign-in failed:', error);
    });
    fetchBins();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const [routeError, setRouteError] = useState(null);

  const handleGenerateRoute = async () => {
    try {
      const authHeaders = await getFirebaseAuthHeaders();
      const res = await fetch(`${API_BASE}/generate-route`, {
        method: 'POST',
        headers: authHeaders
      });
      const contentType = res.headers.get('content-type');

      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        setRoute(null);
        setRouteError({
          errorType: 'BACKEND_OFFLINE',
          errorMessage: 'Backend Express server is offline or unreachable on port 8080. Please run "node backend/index.js" in your terminal.'
        });
        setActiveTab('route');
        showToast("Backend Server Offline: Run 'node backend/index.js'");
        return;
      }

      const data = await res.json();
      if (data.success && data.route) {
        setRoute(data.route);
        setRouteError(null);
        setActiveTab('route');
        showToast("OSRM Road Routing generated priority itinerary!");
      } else if (data.error || data.errorMessage) {
        setRoute(null);
        setRouteError({
          errorType: data.errorType || 'ROUTING_ERROR',
          errorMessage: data.errorMessage || 'Failed to calculate route using OSRM.'
        });
        setActiveTab('route');
        showToast(`Route Error: ${data.errorType || 'Routing Error'}`);
      } else {
        showToast("No bins currently require pickup!");
      }
    } catch (err) {
      console.error(err);
      setRoute(null);
      setRouteError({
        errorType: 'NETWORK_ERROR',
        errorMessage: `Failed to connect to backend server: ${err.message}`
      });
      setActiveTab('route');
    }
  };

  const handlePickupBin = async (binId) => {
    try {
      const authHeaders = await getFirebaseAuthHeaders();
      const res = await fetch(`${API_BASE}/bins/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ binId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Pickup logged for ${binId}. Status reset to Normal.`);
        fetchBins();
      } else {
        showToast(data.error || 'Unable to log pickup.');
      }
    } catch (err) {
      console.error('Pickup failed:', err);
      showToast('Unable to log pickup. Check your connection and sign-in status.');
    }
  };

  const handleClearRoute = () => {
    bins.forEach(b => {
      if (b.status === 'overflowing' || b.predictiveFlag) {
        handlePickupBin(b.id);
      }
    });
    setRoute(null);
    showToast("All route stops serviced & cleared!");
  };

  const handleReportSubmitted = (report) => {
    showToast("Photo submitted! Gemini classified overflow severity.");
    fetchBins();
    setActiveTab('dashboard');
  };

  const highRiskCount = bins.filter(b => b.predictiveFlag && b.status !== 'overflowing').length;
  const overflowingCount = bins.filter(b => b.status === 'overflowing').length;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <Sparkles size={16} className="icon-amber" />
          <span>{notification}</span>
        </div>
      )}

      {/* Municipal Civic Sidebar Navigation */}
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon-bg">
            <Truck size={24} className="icon-amber" />
          </div>
          <div>
            <h2>GARBIN</h2>
            <span className="logo-subtitle">Bengaluru Waste Management</span>
          </div>
        </div>

        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <Map className="icon" size={20} />
            <span>Control Dashboard</span>
            {(highRiskCount > 0 || overflowingCount > 0) && (
              <span className="nav-badge danger">{highRiskCount + overflowingCount}</span>
            )}
          </li>

          <li className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>
            <Camera className="icon" size={20} />
            <span>Report Bin (Gemini)</span>
          </li>

          <li className={activeTab === 'route' ? 'active' : ''} onClick={() => setActiveTab('route')}>
            <Truck className="icon" size={20} />
            <span>Route Agent</span>
            {route && <span className="nav-badge active-route">Active</span>}
          </li>

          <li className={activeTab === 'mcp' ? 'active' : ''} onClick={() => setActiveTab('mcp')}>
            <Cpu className="icon" size={20} />
            <span>MCP Tool Interface</span>
          </li>

          <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            <BarChart3 className="icon" size={20} />
            <span>Impact Analytics</span>
          </li>

          <li className={activeTab === 'submission' ? 'active' : ''} onClick={() => setActiveTab('submission')}>
            <FileCheck className="icon" size={20} />
            <span>Submission Pitch Kit</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="tech-badge">
            <Sparkles size={14} className="icon-amber" />
            <span>Google Build with AI 2026</span>
          </div>
        </div>
      </nav>

      {/* Main App Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title-group">
            <h1>
              {activeTab === 'dashboard' && 'BBMP Municipal Staff Control Center'}
              {activeTab === 'report' && 'Citizen Overflow Reporting'}
              {activeTab === 'route' && 'Sanitation Route Agent'}
              {activeTab === 'mcp' && 'MCP Tool Interface'}
              {activeTab === 'analytics' && 'Operational Impact & Tech Stack'}
              {activeTab === 'submission' && 'Submission & Pitch Kit (1 Aug 2026)'}
            </h1>
            <p className="text-muted text-xs">
              Demand-Driven Waste Collection &bull; Predictive Overflow Engine
            </p>
          </div>

          <div className="topbar-actions">
            <button className="btn-icon" title="Refresh Live Data" onClick={fetchBins}>
              <RefreshCw size={18} className={loadingBins ? 'spinner' : ''} />
            </button>

            <div className="live-status-pill">
              <span className="live-dot"></span>
              <span>Predictive Engine Live</span>
            </div>

            <div className="user-profile">
              <div className="avatar">BBMP</div>
            </div>
          </div>
        </header>

        {/* Tab Content Render */}
        <div className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard 
              bins={bins} 
              route={route} 
              onGenerateRoute={handleGenerateRoute}
              onPickupBin={handlePickupBin}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'report' && (
            <ReportBin onReportSubmitted={handleReportSubmitted} />
          )}

          {activeTab === 'route' && (
            <RoutePlanner 
              bins={bins} 
              route={route} 
              routeError={routeError}
              onGenerateRoute={handleGenerateRoute}
              onClearRoute={handleClearRoute}
            />
          )}

          {activeTab === 'mcp' && (
            <McpInspector />
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}

          {activeTab === 'submission' && (
            <SubmissionKit />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
