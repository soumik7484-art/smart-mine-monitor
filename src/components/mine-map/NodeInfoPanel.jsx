import StatusBadge from '../ui/StatusBadge';

export default function NodeInfoPanel({ node, sensorData, onClose }) {
  if (!node) return null;

  // Find matching sensor data
  const sensor = sensorData?.nodes?.find(n => n.id === node.id) || {};

  return (
    <div className="w-72 bg-mine-surface border border-mine-border rounded shadow-dropdown overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-mine-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-mine-text-primary">
            NODE {node.label || node.id}
          </h3>
          <p className="text-xs text-mine-text-secondary mt-0.5">
            {sensor.location || `Section ${node.section}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={sensor.status || 'SAFE'} />
          <button
            onClick={onClose}
            className="text-mine-text-secondary hover:text-mine-text-primary p-0.5"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sensor readings */}
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SensorReading label="Tilt" value={`${(sensor.tilt || 0).toFixed(1)}°`} status={getSensorStatus(sensor.tilt, 3, 5)} />
          <SensorReading label="Vibration" value={`${(sensor.vibration || 0).toFixed(2)} g`} status={getSensorStatus(sensor.vibration, 0.3, 0.7)} />
          <SensorReading label="Displacement" value={`${(sensor.displacement || 0).toFixed(1)} mm`} status={getSensorStatus(sensor.displacement, 1.5, 3.5)} />
          <SensorReading label="Temperature" value={`${(sensor.temperature || 0).toFixed(1)}°C`} status={getSensorStatus(sensor.temperature, 30, 34)} />
          <SensorReading label="Gas Level" value={sensor.gas || 'Normal'} status={sensor.gas === 'High' ? 'critical' : sensor.gas === 'Elevated' ? 'warning' : 'safe'} />
          <SensorReading label="Battery" value={`${sensor.battery || 0}%`} status={sensor.battery < 30 ? 'critical' : sensor.battery < 60 ? 'warning' : 'safe'} />
        </div>

        {/* Divider */}
        <div className="border-t border-mine-border" />

        {/* Risk score */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-mine-text-secondary uppercase tracking-wider">Risk Score</span>
            <span className="text-sm font-semibold tabular-nums text-mine-text-primary">{sensor.riskScore || 0} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-mine-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${sensor.riskScore || 0}%`,
                backgroundColor: getRiskColor(sensor.riskScore || 0),
              }}
            />
          </div>
        </div>

        {/* Last update */}
        <div className="flex items-center justify-between text-xs text-mine-text-secondary">
          <span>Last update</span>
          <span className="tabular-nums">
            {sensor.lastUpdate
              ? new Date(sensor.lastUpdate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '—'}
          </span>
        </div>

        {/* Signal */}
        <div className="flex items-center justify-between text-xs text-mine-text-secondary">
          <span>Signal</span>
          <span className="flex items-center gap-1">
            <SignalIcon quality={sensor.signal || 'Good'} />
            {sensor.signal || 'Good'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SensorReading({ label, value, status }) {
  const colors = {
    safe: 'text-status-safe',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  };

  return (
    <div>
      <dt className="text-xs text-mine-text-secondary">{label}</dt>
      <dd className={`text-sm font-semibold tabular-nums ${colors[status] || 'text-mine-text-primary'}`}>
        {value}
      </dd>
    </div>
  );
}

function getSensorStatus(value, warnThreshold, critThreshold) {
  if (value == null) return 'safe';
  if (value >= critThreshold) return 'critical';
  if (value >= warnThreshold) return 'warning';
  return 'safe';
}

function getRiskColor(score) {
  if (score >= 80) return '#C4362E';
  if (score >= 65) return '#D97706';
  if (score >= 40) return '#C4820E';
  return '#2D8A4E';
}

function SignalIcon({ quality }) {
  const bars = quality === 'Good' ? 3 : quality === 'Fair' ? 2 : 1;
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <rect x="0" y="7" width="3" height="3" rx="0.5" fill={bars >= 1 ? '#292722' : '#D8D3CA'} />
      <rect x="4.5" y="4" width="3" height="6" rx="0.5" fill={bars >= 2 ? '#292722' : '#D8D3CA'} />
      <rect x="9" y="0" width="3" height="10" rx="0.5" fill={bars >= 3 ? '#292722' : '#D8D3CA'} />
    </svg>
  );
}
