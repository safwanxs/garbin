/**
 * Garbin Predictive Overflow Engine
 * Identifies high-risk waste bins before overflow occurs using historical report frequency,
 * pickup gaps, and fill velocity heuristics.
 */

function calculateBinRisk(bin, reports = []) {
  // Filter reports for this bin in the past 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const binReports = reports.filter(r => 
    r.binId === bin.id && new Date(r.reportedAt) >= sevenDaysAgo
  );

  const reportCountPastWeek = binReports.length;

  // Calculate days since last pickup
  const lastPickup = bin.lastPickupDate ? new Date(bin.lastPickupDate) : new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const diffTime = Math.abs(now - lastPickup);
  const daysSinceLastPickup = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Primary Heuristic (Submission Differentiator):
  // Bins reported >= 2 times in the past week with no logged pickup (> 2 days) -> Auto-flagged as high risk!
  const isHighRiskHeuristic = reportCountPastWeek >= 2 && daysSinceLastPickup >= 2;

  // Quantitative Risk Score (0.0 to 1.0)
  let riskScore = 0.15; // baseline risk
  riskScore += reportCountPastWeek * 0.25;
  riskScore += daysSinceLastPickup * 0.12;

  if (bin.status === 'overflowing') {
    riskScore = 1.0;
  }

  riskScore = Math.min(1.0, Math.round(riskScore * 100) / 100);

  const predictiveFlag = isHighRiskHeuristic || riskScore >= 0.65;
  
  let riskReason = "Normal fill rate within scheduled SLA.";
  if (bin.status === 'overflowing') {
    riskReason = "ACTIVE OVERFLOW: Immediate pickup required!";
  } else if (predictiveFlag) {
    riskReason = `PREDICTIVE ALERT: ${reportCountPastWeek} reports in 7 days & ${daysSinceLastPickup} days without pickup. High overflow probability in next 24h!`;
  }

  return {
    ...bin,
    reportCountPastWeek,
    daysSinceLastPickup,
    predictiveFlag,
    riskScore,
    riskReason,
    status: bin.status === 'overflowing' ? 'overflowing' : (predictiveFlag ? 'flagged' : 'normal')
  };
}

function processPredictiveLayer(bins, reports) {
  return bins.map(bin => calculateBinRisk(bin, reports));
}

module.exports = {
  calculateBinRisk,
  processPredictiveLayer
};
