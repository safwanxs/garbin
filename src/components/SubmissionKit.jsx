import React, { useState } from 'react';
import { Copy, Check, FileText, Video, CheckSquare, Sparkles } from 'lucide-react';

const DRAFTS = {
  description: `Garbin is an AI agent that replaces fixed municipal waste-pickup schedules with a live, demand-driven system. Residents report overflowing bins with a photo through a simple interface; Gemini classifies severity in real time. A predictive layer flags bins likely to overflow before they're even reported, based on historical report and pickup patterns. An ADK-orchestrated routing agent then generates a prioritized daily pickup route for the sanitation team, and a live Firebase-backed dashboard gives municipal staff real-time visibility into bin status across the city.`,
  
  differentiator: `Most waste-management tools are reactive — they only show a bin's status after someone reports it. Garbin's predictive layer flags high-risk bins in advance, using report frequency and pickup-gap patterns, so sanitation teams can act before overflow happens rather than after. Combining this prediction with automatic route generation turns a passive reporting tool into an active planning agent. Bins reported more than twice in the past week with no logged pickup are auto-flagged as high-risk before overflowing.`,

  roadblocks: `Gemini occasionally misclassified partially-full bins as overflowing in early testing; this was addressed by adding a confidence threshold and a lightweight human-in-the-loop confirmation step for borderline cases. Generating realistic route data without access to a live municipal API required building a mock dataset and simulating pickup logs to validate the routing agent's output.`
};

const VIDEO_SCRIPT = [
  { time: '0:00–0:10', title: 'State the Problem', detail: 'Fixed pickup schedules, overflowing bins, no resident reporting channel, no live visibility.' },
  { time: '0:10–0:35', title: 'Resident Photo Upload', detail: 'Show resident reporting an overflowing bin via photo; Gemini classifies it instantly with a severity score.' },
  { time: '0:35–1:05', title: 'Predictive Live Dashboard', detail: 'Show live dashboard updating in real time, including predictive high-risk flag on a bin before report.' },
  { time: '1:05–1:35', title: 'ADK Routing Agent', detail: 'Show ADK routing agent auto-generating the day\'s optimized pickup route for the sanitation team.' },
  { time: '1:35–1:50', title: 'Name Google Stack Out Loud', detail: 'Explicitly say: "Gemini, Vertex AI, ADK, Firebase, Cloud Run, MCP" for judges.' },
  { time: '1:50–2:00', title: 'Close with Differentiator', detail: 'One sentence on predictive overflow alerts before residents even report.' }
];

export default function SubmissionKit() {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="submission-kit-container">
      <div className="kit-header">
        <div className="kit-title-row">
          <Sparkles className="text-warning" size={24} />
          <h2>Garbin Submission &amp; Pitch Kit</h2>
        </div>
        <p className="text-muted">Ready-to-use form drafts, demo video script, and official Google submission checklist for 1 August 2026.</p>
      </div>

      {/* Draft Texts Card Grid */}
      <div className="drafts-grid">
        <div className="draft-card">
          <div className="draft-card-header">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <h3>Agent Description</h3>
            </div>
            <button 
              className={`copy-btn ${copiedKey === 'desc' ? 'copied' : ''}`}
              onClick={() => handleCopy('desc', DRAFTS.description)}
            >
              {copiedKey === 'desc' ? <Check size={16} /> : <Copy size={16} />}
              {copiedKey === 'desc' ? 'Copied!' : 'Copy Draft'}
            </button>
          </div>
          <p className="draft-body">{DRAFTS.description}</p>
        </div>

        <div className="draft-card highlight-border">
          <div className="draft-card-header">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-warning" />
              <h3>How Is Your Agent Different? (Headline)</h3>
            </div>
            <button 
              className={`copy-btn ${copiedKey === 'diff' ? 'copied' : ''}`}
              onClick={() => handleCopy('diff', DRAFTS.differentiator)}
            >
              {copiedKey === 'diff' ? <Check size={16} /> : <Copy size={16} />}
              {copiedKey === 'diff' ? 'Copied!' : 'Copy Draft'}
            </button>
          </div>
          <p className="draft-body">{DRAFTS.differentiator}</p>
        </div>

        <div className="draft-card">
          <div className="draft-card-header">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <h3>Major Roadblocks Faced</h3>
            </div>
            <button 
              className={`copy-btn ${copiedKey === 'road' ? 'copied' : ''}`}
              onClick={() => handleCopy('road', DRAFTS.roadblocks)}
            >
              {copiedKey === 'road' ? <Check size={16} /> : <Copy size={16} />}
              {copiedKey === 'road' ? 'Copied!' : 'Copy Draft'}
            </button>
          </div>
          <p className="draft-body">{DRAFTS.roadblocks}</p>
        </div>
      </div>

      {/* Demo Video Script (2 Minutes) */}
      <div className="video-script-panel">
        <div className="panel-title">
          <Video size={20} className="text-primary" />
          <h3>2-Minute Demo Video Outline</h3>
        </div>

        <div className="timeline-grid">
          {VIDEO_SCRIPT.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <span className="timestamp-pill">{item.time}</span>
              <div>
                <h4>{item.title}</h4>
                <p className="text-muted text-sm">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
