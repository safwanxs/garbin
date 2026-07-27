import React from 'react';
import { AlertTriangle, Clock, MapPin, FileCheck, ShieldAlert, Sparkles } from 'lucide-react';

/**
 * PredictiveCitationSlip Component
 * Visual metaphor of an official BBMP Municipal Civic Inspection Ticket.
 * Displays the exact heuristic evidence: report velocity, days without pickup, risk score, and inspector alert.
 */
export default function PredictiveCitationSlip({ bin, onActionClick, actionLabel = "Add to Route" }) {
  if (!bin) return null;

  const isOverflow = bin.status === 'overflowing';
  const riskPct = Math.round((bin.riskScore || 0.85) * 100);

  return (
    <div className={`citation-slip ${isOverflow ? 'critical-spill' : 'predictive-flag'}`}>
      {/* Top Punchhole / Staple Visual Header */}
      <div className="slip-top-notch">
        <div className="notch-hole left"></div>
        <div className="notch-bar">
          <span className="slip-dept-tag">BBMP SANITATION INSPECTION NOTICE</span>
        </div>
        <div className="notch-hole right"></div>
      </div>

      <div className="slip-body">
        {/* Ticket Header */}
        <div className="slip-header-row">
          <div>
            <span className="slip-ticket-id">REF #{bin.id}</span>
            <h4 className="slip-zone"><MapPin size={13} className="inline-icon" /> {bin.zone || 'Central Zone'}</h4>
          </div>
          <div className="slip-risk-stamp">
            <span className="stamp-score">{riskPct}%</span>
            <span className="stamp-label">{isOverflow ? 'CRITICAL' : 'HIGH RISK'}</span>
          </div>
        </div>

        <p className="slip-address">{bin.address}</p>

        {/* Heuristic Inspection Evidence Checklist */}
        <div className="slip-evidence-box">
          <div className="evidence-item">
            <ShieldAlert size={14} className="icon-gold" />
            <span>Citizen Report Velocity: <strong>{bin.reportCountPastWeek || 2} reports / 7 days</strong></span>
          </div>
          <div className="evidence-item">
            <Clock size={14} className="icon-blue" />
            <span>Pickup SLA Gap: <strong>{bin.daysSinceLastPickup || 4} days unserviced</strong></span>
          </div>
        </div>

        {/* Reason Detail Note */}
        <div className="slip-note-footer">
          <p className="note-text">
            <Sparkles size={12} className="inline-icon" /> {bin.riskReason || 'Predictive alert triggered prior to overflow.'}
          </p>
        </div>

        {/* Action Button */}
        {onActionClick && (
          <button className="slip-action-btn" onClick={() => onActionClick(bin)}>
            {actionLabel}
          </button>
        )}
      </div>

      {/* Jagged / Perforated Ticket Bottom Edge */}
      <div className="slip-tear-edge"></div>
    </div>
  );
}
