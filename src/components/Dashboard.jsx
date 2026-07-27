import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, Truck, Sparkles, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import MapView from './MapView';

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
      {/* Top Banner Callout for Differentiator */}
      <div className="differentiator-banner">
        <div className="banner-badge">
          <Sparkles size={18} className="text-warning" />
          <span>Headline Differentiator</span>
        </div>
        <div className="banner-content">
          <h3>Predictive Overflow Alert Engine</h3>
          <p>Garbin auto-flags bins reported <strong>&gt;2 times in 7 days without pickup</strong> before they overflow. Active AI risk scanning runs every 15 mins.</p>
        </div>
        <button className="btn-accent" onClick={onGenerateRoute}>
          <Truck size={18} />
          Run ADK Routing Agent
        </button>
      </div>

      {/* Stats Summary Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Active Bins</span>
            <div className="stat-icon-wrapper blue"><Truck size={20} /></div>
          </div>
          <p className="stat-value">{bins.length}</p>
          <span className="stat-subtext">Monitored across 6 zones</span>
        </div>

        <div className="stat-card alert highlight-pulse">
          <div className="stat-header">
            <span className="stat-title">Predictive High-Risk</span>
            <div className="stat-icon-wrapper warning"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value-row">
            <p className="stat-value text-warning">{highRiskBins.length}</p>
            <span className="stat-badge warning">Pre-Overflow</span>
          </div>
          <span className="stat-subtext">Bins flagged before resident report</span>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <span className="stat-title">Active Overflows</span>
            <div className="stat-icon-wrapper danger"><Flame size={20} /></div>
          </div>
          <div className="stat-value-row">
            <p className="stat-value text-danger">{overflowingBins.length}</p>
            <span className="stat-badge danger">Urgent</span>
          </div>
          <span className="stat-subtext">Resident & Gemini verified</span>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-title">Normal / Within SLA</span>
            <div className="stat-icon-wrapper success"><CheckCircle2 size={20} /></div>
          </div>
          <p className="stat-value text-primary">{normalBins.length}</p>
          <span className="stat-subtext">Pickups up to date</span>
        </div>
      </section>

      {/* Main View Grid: Live Map + Predictive Alert Feed */}
      <div className="dashboard-main-grid">
        <div className="map-panel">
          <div className="panel-header">
            <div>
              <h2>Live City GIS Map</h2>
              <p className="text-muted">Real-time bin status, predictive flags & ADK truck routes</p>
            </div>
            {route && (
              <div className="active-route-chip">
                <Truck size={16} /> Route Active: {route.totalDistanceKm} km
              </div>
            )}
          </div>
          <MapView bins={bins} route={route} onPickupBin={onPickupBin} onSelectBin={onSelectBin} />
        </div>

        {/* Right Sidebar Feed: Predictive High Risk & Urgent List */}
        <div className="side-feed-panel">
          <div className="feed-header">
            <ShieldAlert size={20} className="text-warning" />
            <h3>Predictive Risk Feed</h3>
          </div>

          <div className="feed-list">
            {highRiskBins.length === 0 && overflowingBins.length === 0 ? (
              <div className="empty-feed">
                <CheckCircle2 size={36} className="text-primary" />
                <p>All city bins are operating normally within SLA!</p>
              </div>
            ) : (
              <>
                {overflowingBins.map(bin => (
                  <div key={bin.id} className="feed-card danger">
                    <div className="feed-card-header">
                      <span className="status-pill danger">CRITICAL OVERFLOW</span>
                      <span className="time-pill"><Clock size={12} /> {bin.daysSinceLastPickup || 4}d unserviced</span>
                    </div>
                    <h4 className="bin-address"><MapPin size={14} /> {bin.address}</h4>
                    <p className="feed-reason">{bin.riskReason}</p>
                    <div className="feed-actions">
                      <button className="btn-sm primary" onClick={() => onPickupBin(bin.id)}>
                        Mark Picked Up
                      </button>
                    </div>
                  </div>
                ))}

                {highRiskBins.map(bin => (
                  <div key={bin.id} className="feed-card warning">
                    <div className="feed-card-header">
                      <span className="status-pill warning">PREDICTIVE HIGH RISK</span>
                      <span className="time-pill">Risk Score: {Math.round((bin.riskScore || 0.8) * 100)}%</span>
                    </div>
                    <h4 className="bin-address"><MapPin size={14} /> {bin.address}</h4>
                    <p className="feed-reason">{bin.riskReason}</p>
                    <div className="feed-actions">
                      <button className="btn-sm secondary" onClick={onGenerateRoute}>
                        Add to Route
                      </button>
                      <button className="btn-sm primary" onClick={() => onPickupBin(bin.id)}>
                        Dispatch & Clear
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <button className="view-all-link" onClick={() => onNavigateTab('route')}>
            Open ADK Route Planner <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
