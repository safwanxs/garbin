import React, { useState } from 'react';
import { Terminal, Play, Code2, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config';

const SAMPLE_MCP_TOOLS = [
  {
    name: 'get_bin_status',
    description: 'Retrieves current status, fill metrics, and predictive risk score for a municipal waste bin.',
    sampleParams: { binId: 'bin_indira_101' }
  },
  {
    name: 'predict_overflow_risk',
    description: 'Runs predictive overflow heuristics on all active municipal bins in a given zone.',
    sampleParams: { zone: 'Indiranagar' }
  },
  {
    name: 'generate_sanitation_route',
    description: 'Triggers ADK routing agent to calculate an optimized pickup sequence for overflowing and high-risk bins.',
    sampleParams: { includePredictiveBins: true }
  },
  {
    name: 'escalate_unresolved_report',
    description: 'Auto-escalates unserviced reports older than 24h to municipal supervisor with photo proof.',
    sampleParams: { reportId: 'rep_1001', supervisorEmail: 'supervisor.bbmp@gov.in' }
  }
];

export default function McpInspector() {
  const [selectedTool, setSelectedTool] = useState(SAMPLE_MCP_TOOLS[0]);
  const [jsonParams, setJsonParams] = useState(JSON.stringify(SAMPLE_MCP_TOOLS[0].sampleParams, null, 2));
  const [loading, setLoading] = useState(false);
  const [mcpResponse, setMcpResponse] = useState(null);

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setJsonParams(JSON.stringify(tool.sampleParams, null, 2));
    setMcpResponse(null);
  };

  const handleExecuteTool = async () => {
    setLoading(true);
    setMcpResponse(null);

    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(jsonParams);
      } catch (err) {
        alert("Invalid JSON parameters format.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/mcp/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool.name,
          params: parsedParams
        })
      });

      const data = await response.json();
      setMcpResponse(data);
    } catch (error) {
      console.error(error);
      setMcpResponse({ error: "Failed to connect to MCP Server backend endpoint." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mcp-inspector-container">
      <div className="mcp-header">
        <div className="mcp-title">
          <Cpu className="icon-amber" size={24} />
          <h2>MCP-Schema Compatible Tool Interface</h2>
        </div>
        <p className="text-muted">Garbin exposes standard MCP tool schemas so external AI agents, municipal assistants, or supervisors can interact seamlessly with city waste infrastructure.</p>
      </div>

      <div className="mcp-grid">
        {/* Left Column: Registered Tools List */}
        <div className="tools-list-card">
          <h3>Registered MCP Tools</h3>
          <div className="tools-menu">
            {SAMPLE_MCP_TOOLS.map(t => (
              <div 
                key={t.name}
                className={`tool-menu-item ${selectedTool.name === t.name ? 'active' : ''}`}
                onClick={() => handleSelectTool(t)}
              >
                <div className="tool-item-header">
                  <Terminal size={16} className="icon-amber" />
                  <strong>{t.name}</strong>
                </div>
                <p className="tool-desc">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Execution Sandbox & Console Output */}
        <div className="sandbox-card">
          <div className="sandbox-header">
            <div>
              <h3>Tool: <code>{selectedTool.name}</code></h3>
              <p className="text-muted text-xs">JSON-RPC / MCP Execution Console</p>
            </div>
            <button className="civic-btn-primary" onClick={handleExecuteTool} disabled={loading}>
              {loading ? <RefreshCw className="spinner" size={16} /> : <Play size={16} />}
              {loading ? 'Executing...' : 'Run MCP Tool'}
            </button>
          </div>

          <div className="code-editor-block">
            <label className="editor-label"><Code2 size={14} /> Request Parameters (JSON):</label>
            <textarea 
              className="json-textarea"
              value={jsonParams}
              onChange={(e) => setJsonParams(e.target.value)}
              rows={5}
            />
          </div>

          <div className="console-output-block">
            <div className="console-bar">
              <span>MCP Protocol Response Output</span>
              {mcpResponse && <span className="status-ok"><CheckCircle2 size={12} /> 200 OK</span>}
            </div>
            <pre className="json-output">
              {mcpResponse 
                ? JSON.stringify(mcpResponse, null, 2) 
                : '// Click "Run MCP Tool" to execute tool call and view JSON-RPC payload response...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
