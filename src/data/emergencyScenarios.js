export const emergencyStages = {
  NORMAL: { label: 'System Ready', description: 'No active emergency.', color: 'safe' },
  ANOMALY_DETECTED: { label: 'Anomaly Detected', description: 'Unusual sensor readings detected. Investigating potential issues.', color: 'warning' },
  RISK_ELEVATED: { label: 'Risk Elevated', description: 'Multiple sensors showing warning signs. Preparations for response initiated.', color: 'attention' },
  HAZARD_CONFIRMED: { label: 'Hazard Confirmed', description: 'Critical thresholds exceeded. Imminent danger in affected zones.', color: 'critical' },
  TUNNEL_BLOCKED: { label: 'Tunnel Blocked', description: 'Structural failure or severe hazard blocking designated pathways.', color: 'critical' },
  EVACUATION_ACTIVE: { label: 'Evacuation Active', description: 'Immediate evacuation ordered. Personnel moving to safe zones.', color: 'critical' },
  RESOLVED: { label: 'Resolved', description: 'Emergency situation resolved. Normal operations resuming.', color: 'safe' }
};

export function getEmergencyTimeline() {
  const now = new Date();
  return [
    { time: new Date(now.getTime() - 7200000), event: 'Routine maintenance completed', stage: 'NORMAL' },
    { time: new Date(now.getTime() - 3600000), event: 'Shift change logged', stage: 'NORMAL' },
    { time: new Date(now.getTime() - 1800000), event: 'Minor vibration detected in Section B', stage: 'ANOMALY_DETECTED' },
    { time: new Date(now.getTime() - 900000), event: 'Gas levels increasing near B-04', stage: 'RISK_ELEVATED' }
  ];
}
