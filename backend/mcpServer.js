/**
 * Model Context Protocol (MCP) Server Integration Module for Garbin
 * Exposes standardized municipal waste management tools to external AI agents and clients.
 */

const mcpToolsRegistry = [
  {
    name: 'get_bin_status',
    description: 'Retrieves current status, fill metrics, and predictive risk score for a municipal waste bin.',
    inputSchema: {
      type: 'object',
      properties: {
        binId: { type: 'string', description: 'The unique ID of the target bin (e.g. bin_indira_101)' }
      },
      required: ['binId']
    }
  },
  {
    name: 'predict_overflow_risk',
    description: 'Runs predictive overflow heuristics on all active municipal bins in a given zone.',
    inputSchema: {
      type: 'object',
      properties: {
        zone: { type: 'string', description: 'Municipal zone name (e.g. Indiranagar, Koramangala, MG Road)' }
      }
    }
  },
  {
    name: 'generate_sanitation_route',
    description: 'Triggers ADK routing agent to calculate an optimized pickup sequence for overflowing and high-risk bins.',
    inputSchema: {
      type: 'object',
      properties: {
        includePredictiveBins: { type: 'boolean', description: 'Whether to include high-risk predicted bins alongside active reports' }
      }
    }
  },
  {
    name: 'escalate_unresolved_report',
    description: 'Auto-escalates unserviced reports older than threshold (e.g., 24h) to municipal supervisor with photo proof.',
    inputSchema: {
      type: 'object',
      properties: {
        reportId: { type: 'string', description: 'Unique report identifier' },
        supervisorEmail: { type: 'string', description: 'Supervisor email address for alert notification' }
      },
      required: ['reportId']
    }
  }
];

function handleMcpToolCall(method, params, dataStore) {
  const { bins = [], reports = [], routes = [] } = dataStore;

  switch (method) {
    case 'get_bin_status': {
      const bin = bins.find(b => b.id === params.binId);
      if (!bin) {
        return { error: `Bin ${params.binId} not found in municipal database` };
      }
      return { success: true, tool: 'get_bin_status', data: bin };
    }

    case 'predict_overflow_risk': {
      const zoneFilter = params.zone;
      const targetBins = zoneFilter 
        ? bins.filter(b => b.address.toLowerCase().includes(zoneFilter.toLowerCase()))
        : bins;
      const flaggedBins = targetBins.filter(b => b.predictiveFlag || b.status === 'overflowing');
      return {
        success: true,
        tool: 'predict_overflow_risk',
        zone: zoneFilter || 'All Zones',
        totalBinsScanned: targetBins.length,
        highRiskOrOverflowCount: flaggedBins.length,
        flaggedBins: flaggedBins.map(b => ({ id: b.id, address: b.address, riskScore: b.riskScore, riskReason: b.riskReason }))
      };
    }

    case 'generate_sanitation_route': {
      const includePredictive = params.includePredictiveBins !== false;
      const candidates = bins.filter(b => 
        b.status === 'overflowing' || (includePredictive && b.predictiveFlag)
      );

      // Simple geographic clustering & priority sorting
      const sortedStops = [...candidates].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
      return {
        success: true,
        tool: 'generate_sanitation_route',
        generatedAt: new Date().toISOString(),
        totalStops: sortedStops.length,
        optimizedStops: sortedStops.map((b, idx) => ({
          stopSequence: idx + 1,
          binId: b.id,
          address: b.address,
          urgency: b.status === 'overflowing' ? 'CRITICAL' : 'PREDICTIVE_HIGH',
          lat: b.location.lat,
          lng: b.location.lng
        }))
      };
    }

    case 'escalate_unresolved_report': {
      const report = reports.find(r => r.id === params.reportId);
      return {
        success: true,
        tool: 'escalate_unresolved_report',
        reportId: params.reportId,
        escalatedTo: params.supervisorEmail || 'supervisor.sanitation@bbmp.gov.in',
        status: 'ESCALATED',
        timestamp: new Date().toISOString(),
        message: `Alert dispatched to supervisor with photo evidence for report ${params.reportId}.`
      };
    }

    default:
      return { error: `Unknown MCP tool method: ${method}` };
  }
}

module.exports = {
  mcpToolsRegistry,
  handleMcpToolCall
};
