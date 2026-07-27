import React, { useState } from 'react';
import { Truck, MapPin, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Gauge, Leaf, Clock, Navigation } from 'lucide-react';
import MapView from './MapView';

export default function RoutePlanner({ bins = [], route = null, onGenerateRoute, onClearRoute }) {
  const [loading, setLoading] = useState(false);

  const handleRunAgent = async () => {
    setLoading(true);
    await onGenerateRoute();
    setLoading(false);
  };

  const candidateBins = bins.filter(b => b.status === 'overflowing' || b.predictiveFlag);

  return (
    <div className="route-planner-container">
      <div className="planner-header-card">
        <div className="header-left">
          <div className="adk-badge">
            <Sparkles size={16} /> ADK Multi-Agent Orchestration
          </div>
          <h2>Sanitation Route Planner</h2>
          <p className="text-muted">Takes today's resident reports &amp; predictive overflow alerts and generates an optimized truck itinerary.</p>
        </div>

        <button className="btn-primary btn-lg" onClick={handleRunAgent} disabled={loading}>
          <Truck size={20} />
          {loading ? 'ADK Agent Optimizing Route...' : 'Generate Today\'s Optimized Route'}
        </button>
      </div>

      {/* Impact Metrics Row */}
      {route && (
        <div className="impact-metrics-row">
          <div className="metric-box">
            <div className="metric-icon blue"><Navigation size={22} /></div>
            <div>
              <span className="metric-label">Optimized Distance</span>
              <h3 className="metric-val">{route.totalDistanceKm} km</h3>
              <span className="metric-sub text-primary">-32% vs static routes</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon orange"><Clock size={22} /></div>
            <div>
              <span className="metric-label">Est. Completion Time</span>
              <h3 className="metric-val">{route.estimatedDurationMins} mins</h3>
              <span className="metric-sub text-muted">2 Trucks assigned</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon green"><Leaf size={22} /></div>
            <div>
              <span className="metric-label">CO2 Emissions Saved</span>
              <h3 className="metric-val text-primary">{route.co2SavedKg} kg</h3>
              <span className="metric-sub text-primary">Eco-optimized routing</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon purple"><Gauge size={22} /></div>
            <div>
              <span className="metric-label">Total Priority Stops</span>
              <h3 className="metric-val">{route.stopSequence ? route.stopSequence.length : candidateBins.length} Bins</h3>
              <span className="metric-sub text-warning">{candidateBins.filter(b => b.predictiveFlag && b.status !== 'overflowing').length} Predictive Stops</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Map & Itinerary List */}
      <div className="planner-main-grid">
        <div className="itinerary-panel">
          <div className="panel-title-bar">
            <h3>Turn-by-Turn Pickup Itinerary</h3>
            {route && <span className="route-id-tag">{route.routeId}</span>}
          </div>

          {!route ? (
            <div className="no-route-placeholder">
              <Truck size={48} className="text-muted" />
              <h4>No Active Route Generated Yet</h4>
              <p className="text-muted">Click <strong>"Generate Today's Optimized Route"</strong> to trigger the ADK routing agent.</p>
              <button className="btn-secondary" onClick={handleRunAgent}>
                Generate Route Now
              </button>
            </div>
          ) : (
            <div className="stops-timeline">
              {route.stopSequence.map((stopId, idx) => {
                const bin = bins.find(b => b.id === stopId) || { id: stopId, address: stopId, status: 'flagged' };
                const isOverflow = bin.status === 'overflowing';

                return (
                  <div key={stopId} className="timeline-stop-card">
                    <div className="stop-number">{idx + 1}</div>
                    <div className="stop-content">
                      <div className="stop-header">
                        <span className={`stop-pill ${isOverflow ? 'danger' : 'warning'}`}>
                          {isOverflow ? 'URGENT OVERFLOW' : 'PREDICTIVE HIGH RISK'}
                        </span>
                        <span className="stop-bin-id">{bin.id}</span>
                      </div>
                      <h4>{bin.address || `Municipal Bin Stop #${stopId}`}</h4>
                      <p className="stop-reason">{bin.riskReason || 'Included in high-density route cluster'}</p>
                    </div>
                  </div>
                );
              })}

              <div className="itinerary-footer">
                <button className="btn-success w-full" onClick={onClearRoute}>
                  <CheckCircle2 size={18} /> Mark All Stops Picked Up &amp; Complete Route
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="map-panel">
          <div className="panel-title-bar">
            <h3>Route Visualizer</h3>
            <span className="text-muted">Blue line indicates optimized driver transit path</span>
          </div>
          <MapView bins={bins} route={route} />
        </div>
      </div>
    </div>
  );
}
