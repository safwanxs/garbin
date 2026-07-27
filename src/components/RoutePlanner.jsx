import React, { useState } from 'react';
import { Truck, MapPin, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Gauge, Leaf, Clock, Navigation, AlertTriangle, Key, Info } from 'lucide-react';
import MapView from './MapView';

export default function RoutePlanner({ bins = [], route = null, routeError = null, onGenerateRoute, onClearRoute }) {
  const [loading, setLoading] = useState(false);

  const handleRunAgent = async () => {
    setLoading(true);
    await onGenerateRoute();
    setLoading(false);
  };

  const candidateBins = bins.filter(b => b.status === 'overflowing' || b.predictiveFlag);

  return (
    <div className="route-planner-container">
      {/* Header */}
      <div className="planner-header-card">
        <div className="header-left">
          <div className="adk-badge">
            <Sparkles size={16} /> Priority Nearest-Neighbor + OSRM Road Routing
          </div>
          <h2>Sanitation Route Planner</h2>
          <p className="text-muted">Orders stops by priority tier (critical overflows first, then predictive risk) &amp; computes road routes via OSRM HTTP API.</p>
        </div>

        <button className="civic-btn-primary" onClick={handleRunAgent} disabled={loading}>
          <Truck size={20} />
          {loading ? 'OSRM Agent Optimizing Route...' : 'Generate Today\'s Road Route'}
        </button>
      </div>

      {/* Development / OSRM Disclaimer Banner */}
      <div className="osrm-demo-disclaimer">
        <Info size={16} className="icon-blue inline-icon" />
        <span>
          <strong>OSRM Demo Server Note:</strong> The public OSRM demo server (<code>router.project-osrm.org</code>) is rate-limited and intended for development/testing only — for production, self-host OSRM via Docker or switch to a paid provider.
        </span>
      </div>

      {/* Error State Banner if OSRM Routing call fails */}
      {routeError && (
        <div className="api-error-banner">
          <div className="error-banner-header">
            <AlertTriangle size={24} className="icon-red" />
            <div>
              <h3>OSRM Road Routing Failure ({routeError.errorType})</h3>
              <p className="error-msg-detail">{routeError.errorMessage}</p>
            </div>
          </div>

          <div className="error-instructions">
            <h4><Info size={14} className="inline-icon" /> Troubleshooting Options:</h4>
            <ol>
              <li>If rate-limited (HTTP 429), wait a few seconds and click <strong>"Generate Today's Road Route"</strong> again.</li>
              <li>Ensure your machine has internet connectivity to reach <code>router.project-osrm.org</code>.</li>
              <li>For production environments, self-host OSRM via Docker or connect a dedicated routing service.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Real Impact Metrics Row */}
      {route && (
        <div className="impact-metrics-row">
          <div className="metric-box">
            <div className="metric-icon blue"><Navigation size={22} /></div>
            <div>
              <span className="metric-label">OSRM Road Distance</span>
              <h3 className="metric-val">{route.totalDistanceKm} km</h3>
              <span className="metric-sub text-teal">
                {route.distanceSavingsPct >= 0 ? `${route.distanceSavingsPct}%` : '0%'} vs naive ({route.naiveBaselineKm} km)
              </span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon orange"><Clock size={22} /></div>
            <div>
              <span className="metric-label">Est. Completion Time</span>
              <h3 className="metric-val">{route.estimatedDurationMins} mins</h3>
              <span className="metric-sub text-muted">
                {route.trucksAssigned} Truck{route.trucksAssigned > 1 ? 's' : ''} assigned (Cap: 4 stops/truck)
              </span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon green"><Leaf size={22} /></div>
            <div>
              <span className="metric-label">CO2 Emissions Saved</span>
              <h3 className="metric-val text-teal">{route.co2SavedKg} kg</h3>
              <span className="metric-sub text-teal">Priority routing</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon purple"><Gauge size={22} /></div>
            <div>
              <span className="metric-label">Priority Stops</span>
              <h3 className="metric-val">{route.orderedBins ? route.orderedBins.length : candidateBins.length} Bins</h3>
              <span className="metric-sub text-amber">
                {route.orderedBins ? route.orderedBins.filter(b => b.status === 'overflowing').length : 0} Critical Overflows
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Priority Itinerary & Road Route Visualizer */}
      <div className="planner-main-grid">
        <div className="itinerary-panel">
          <div className="panel-title-bar">
            <h3>Priority Nearest-Neighbor Itinerary</h3>
            {route && <span className="route-id-tag">{route.routeId}</span>}
          </div>

          {!route ? (
            <div className="no-route-placeholder">
              <Truck size={48} className="text-muted" />
              <h4>No Active Road Route Generated</h4>
              <p className="text-muted">Click <strong>"Generate Today's Road Route"</strong> to trigger priority ordering and OSRM road routing.</p>
              <button className="btn-secondary" onClick={handleRunAgent}>
                Generate Route Now
              </button>
            </div>
          ) : (
            <div className="stops-timeline">
              {(route.orderedBins || candidateBins).map((bin, idx) => {
                const isOverflow = bin.status === 'overflowing';

                return (
                  <div key={bin.id} className="timeline-stop-card">
                    <div className="stop-number">{idx + 1}</div>
                    <div className="stop-content">
                      <div className="stop-header">
                        <span className={`stop-pill ${isOverflow ? 'danger' : 'warning'}`}>
                          {isOverflow ? 'CRITICAL OVERFLOW' : 'PREDICTIVE HIGH RISK'}
                        </span>
                        <span className="stop-bin-id">{bin.id}</span>
                      </div>
                      <h4>{bin.address}</h4>
                      <p className="stop-reason">{bin.riskReason || 'High priority inspection stop'}</p>
                    </div>
                  </div>
                );
              })}

              <div className="itinerary-footer">
                <button className="btn-success w-full" onClick={onClearRoute}>
                  <CheckCircle2 size={18} /> Mark All Route Stops Picked Up &amp; Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="map-panel">
          <div className="panel-title-bar">
            <h3>OSRM Road Route Visualizer</h3>
            <span className="text-muted">Blue line indicates OSRM GeoJSON road polyline</span>
          </div>
          <MapView bins={bins} route={route} />
        </div>
      </div>
    </div>
  );
}
