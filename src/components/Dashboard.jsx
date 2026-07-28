import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, Truck, Sparkles, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import MapView from './MapView';
import PredictiveCitationSlip from './PredictiveCitationSlip';

export default function Dashboard({ 
  bins = [], 
  route = null, 
  onGenerateRoute, 
  onPickupBin, 
  onNavigateTab,
  onSelectBin
}) {
  const overflowingBins = bins.filter(b => b.status === 'overflowing');
  const highRiskBins = bins.filter(b => b.predictiveFlag && b.status !== 'overflowing');
  const normalBins = bins.filter(b => b.status === 'normal' && !b.predictiveFlag);

  return (
    <div className="dashboard-layout">
      {/* Persistent 3-Tier Civic Bin Status Spine */}
      <div className="status-spine-bar">
        <div className="spine-segment normal">
          <div className="segment-badge">
            <span className="dot dot-normal"></span>
            <span className="spine-title">NORMAL STATUS</span>
          </div>
          <div className="segment-metrics">
            <span className="segment-count">{normalBins.length} Bins</span>
            <span className="segment-sub">Within 24h SLA</span>
          </div>
        </div>

        <div className="spine-segment warning active-spine">
          <div className="segment-badge">
            <span className="dot dot-warning"></span>
            <span className="spine-title">PREDICTIVE HIGH-RISK</span>
          </div>
          <div className="segment-metrics">
            <span className="segment-count text-amber">{highRiskBins.length} Bins</span>
            <span className="segment-sub">Auto-flagged before spill</span>
          </div>
        </div>

        <div className="spine-segment danger">
          <div className="segment-badge">
            <span className="dot dot-danger"></span>
            <span className="spine-title">ACTIVE OVERFLOWS</span>
          </div>
          <div className="segment-metrics">
            <span className="segment-count text-red">{overflowingBins.length} Bins</span>
            <span className="segment-sub">Gemini Verified</span>
          </div>
        </div>

        <div className="spine-action">
          <button className="civic-dispatch-btn" onClick={onGenerateRoute}>
            <Truck size={18} />
            <span>RUN ROUTE AGENT</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live GIS Map + Predictive Inspection Slips Feed */}
      <div className="dashboard-main-grid">
        <div className="map-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">MUNICIPAL GIS MONITORING</span>
              <h2>Bengaluru Live Sanitation Map</h2>
            </div>
            {route && (
              <div className="active-route-chip">
                <Truck size={16} /> Route Active: {route.totalDistanceKm} km
              </div>
            )}
          </div>
          <MapView bins={bins} route={route} onPickupBin={onPickupBin} onSelectBin={onSelectBin} />
        </div>

        {/* Right Column: Predictive Citation Feed */}
        <div className="side-feed-panel">
          <div className="feed-header">
            <ShieldAlert size={20} className="icon-amber" />
            <div>
              <h3>Predictive Inspection Feed</h3>
              <span className="feed-sub">Headline Heuristic Engine Alerts</span>
            </div>
          </div>

          <div className="feed-list">
            {highRiskBins.length === 0 && overflowingBins.length === 0 ? (
              <div className="empty-feed">
                <CheckCircle2 size={36} className="icon-teal" />
                <p>All municipal bins operating normally within SLA!</p>
              </div>
            ) : (
              <>
                {/* Render Active Overflows & High Risk Bins as Signature Inspection Slips */}
                {overflowingBins.map(bin => (
                  <PredictiveCitationSlip 
                    key={bin.id} 
                    bin={bin} 
                    actionLabel="Mark Picked Up"
                    onActionClick={(b) => onPickupBin(b.id)}
                  />
                ))}

                {highRiskBins.map(bin => (
                  <PredictiveCitationSlip 
                    key={bin.id} 
                    bin={bin} 
                    actionLabel="Add to Route Dispatch"
                    onActionClick={(b) => onPickupBin(b.id)}
                  />
                ))}
              </>
            )}
          </div>

          <button className="view-all-link" onClick={() => onNavigateTab('route')}>
            Open Sanitation Route Planner <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
