import React from 'react';
import StatCard from '../components/ui/StatCard';
import RiskGauge from '../components/ui/RiskGauge';
import SensorChart from '../components/ui/SensorChart';
import StatusBadge from '../components/ui/StatusBadge';

const Overview = ({ sensorData, workers, emergencyState, alerts, riskData, lastSync, mineLayout }) => {
  // Extract history from highest risk node if available
  const history = riskData?.highestRiskNode?.history || {};
  const highestRiskNodeName = riskData?.highestRiskNode?.location || 'Unknown Location';

  const getStatusColor = (status) => {
    switch (status) {
      case 'SAFE': return 'border-status-safe';
      case 'WARNING': return 'border-status-warning';
      case 'CRITICAL': return 'border-status-critical';
      default: return 'border-mine-border';
    }
  };

  return (
    <div className="bg-mine-bg min-h-screen p-6">
      <div className="mb-6">
        <h1 className="page-header text-mine-text-primary text-2xl font-semibold">Mine Operations</h1>
        <p className="page-subtitle text-mine-text-secondary mt-1">Real-time ground stability and worker safety monitoring</p>
      </div>

      {/* Top status strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard 
          label="OVERALL CONDITION" 
          value={sensorData?.overallCondition || 'UNKNOWN'}
          className={`border-l-4 ${getStatusColor(sensorData?.overallCondition)}`}
        />
        <StatCard 
          label="ACTIVE NODES" 
          value={`${sensorData?.activeNodes || 0} / ${sensorData?.totalNodes || 0}`}
        />
        <StatCard 
          label="WORKERS UNDERGROUND" 
          value={workers?.length || 0}
        />
        <StatCard 
          label="ACTIVE ALERTS" 
          value={String(alerts?.length || 0).padStart(2, '0')}
        />
        <StatCard 
          label="SYSTEM HEALTH" 
          value={`${sensorData?.systemHealth || 0}%`}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Mine Stability section */}
        <div className="card bg-mine-surface shadow-card rounded-md border border-mine-border lg:col-span-1">
          <div className="card-header border-b border-mine-border p-4">
            <h2 className="section-title text-mine-text-primary font-semibold tracking-wide text-sm uppercase">Mine Stability</h2>
          </div>
          <div className="card-body flex flex-col items-center justify-center p-6 space-y-6">
            <RiskGauge value={riskData?.overallRisk || 0} />
            <div className="w-full text-center space-y-2">
              <div className="text-xl font-semibold text-mine-text-primary">
                {riskData?.overallCondition || 'UNKNOWN'}
              </div>
              <div className="text-sm text-mine-text-secondary uppercase tracking-wider">
                Highest Risk: {highestRiskNodeName}
              </div>
              <p className="text-sm text-mine-text-primary mt-4 max-w-xs mx-auto">
                {riskData?.decision || 'No automated decision available.'}
              </p>
            </div>
            <div className="text-xs text-mine-text-secondary w-full text-right mt-4 pt-4 border-t border-mine-border">
              Last Updated: {lastSync ? lastSync.toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Live Sensor Trends */}
        <div className="card bg-mine-surface shadow-card rounded-md border border-mine-border lg:col-span-2">
          <div className="card-header border-b border-mine-border p-4">
            <h2 className="section-title text-mine-text-primary font-semibold tracking-wide text-sm uppercase">Live Sensor Trends ({highestRiskNodeName})</h2>
          </div>
          <div className="card-body p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SensorChart label="Ground Displacement (mm)" data={history.displacement || []} dataKey="value" color="#C4820E" height={160} />
            <SensorChart label="Tilt (degrees)" data={history.tilt || []} dataKey="value" color="#D97706" height={160} />
            <SensorChart label="Vibration (g)" data={history.vibration || []} dataKey="value" color="#C4362E" height={160} />
            <SensorChart label="Temperature (°C)" data={history.temperature || []} dataKey="value" color="#2D8A4E" height={160} />
            <SensorChart label="Gas Concentration" data={history.gasValue || []} dataKey="value" color="#292722" height={160} />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="card bg-mine-surface shadow-card rounded-md border border-mine-border w-full">
        <div className="card-header border-b border-mine-border p-4">
          <h2 className="section-title text-mine-text-primary font-semibold tracking-wide text-sm uppercase">Active Alerts</h2>
        </div>
        <div className="card-body overflow-x-auto">
          <table className="data-table w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-mine-border text-xs text-mine-text-secondary uppercase tracking-wider bg-mine-surface-alt">
                <th className="p-3 font-semibold">Time</th>
                <th className="p-3 font-semibold">Location</th>
                <th className="p-3 font-semibold">Sensor</th>
                <th className="p-3 font-semibold">Event</th>
                <th className="p-3 font-semibold">Severity</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts && alerts.length > 0 ? (
                alerts.map(alert => (
                  <tr key={alert.id} className="border-b border-mine-border last:border-b-0 hover:bg-mine-surface-alt transition-colors">
                    <td className="p-3 text-sm text-mine-text-primary tabular-nums whitespace-nowrap">{alert.time}</td>
                    <td className="p-3 text-sm font-medium text-mine-text-primary">{alert.location}</td>
                    <td className="p-3 text-sm text-mine-text-secondary">{alert.sensor}</td>
                    <td className="p-3 text-sm text-mine-text-primary">{alert.event}</td>
                    <td className="p-3"><StatusBadge status={alert.severity} type="severity" /></td>
                    <td className="p-3"><StatusBadge status={alert.status} type="status" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-mine-text-secondary text-sm">
                    No active alerts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
