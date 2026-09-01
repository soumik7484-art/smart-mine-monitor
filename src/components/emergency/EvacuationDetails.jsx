export default function EvacuationDetails({ emergencyState }) {
  if (!emergencyState?.active || !emergencyState.evacuationRoute) return null;

  const { evacuationRoute, affectedWorkers, blockedTunnels, section } = emergencyState;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-mine-text-primary">Recommended Evacuation Route</h3>
      </div>
      <div className="card-body space-y-4">
        {/* Route path */}
        <div>
          <span className="section-title block mb-2">Route Path</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {evacuationRoute.path.map((nodeId, i) => (
              <span key={nodeId} className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  i === 0
                    ? 'bg-status-critical-bg text-status-critical'
                    : i === evacuationRoute.path.length - 1
                    ? 'bg-status-safe-bg text-status-safe'
                    : 'bg-mine-surface-alt text-mine-text-primary'
                }`}>
                  {nodeId}
                </span>
                {i < evacuationRoute.path.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2L8 6L4 10" stroke="#6F6A61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Route metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-mine-border">
          <div>
            <span className="text-xs text-mine-text-secondary">Route Distance</span>
            <p className="text-sm font-semibold tabular-nums text-mine-text-primary">{evacuationRoute.distance}</p>
          </div>
          <div>
            <span className="text-xs text-mine-text-secondary">Estimated Time</span>
            <p className="text-sm font-semibold tabular-nums text-mine-text-primary">{evacuationRoute.estimatedTime}</p>
          </div>
          <div>
            <span className="text-xs text-mine-text-secondary">Affected Zone</span>
            <p className="text-sm font-semibold text-mine-text-primary">{section}</p>
          </div>
          <div>
            <span className="text-xs text-mine-text-secondary">Last Calculation</span>
            <p className="text-sm font-semibold tabular-nums text-mine-text-primary">
              {evacuationRoute.calculatedAt
                ? new Date(evacuationRoute.calculatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '—'}
            </p>
          </div>
        </div>

        {/* Blocked tunnels */}
        {blockedTunnels && blockedTunnels.length > 0 && (
          <div className="pt-3 border-t border-mine-border">
            <span className="section-title block mb-2">Blocked Tunnels</span>
            <div className="flex flex-wrap gap-2">
              {blockedTunnels.map(tunnel => (
                <span key={tunnel} className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-status-critical-bg text-status-critical">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {tunnel.replace('_', ' → ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Affected workers */}
        <div className="pt-3 border-t border-mine-border">
          <span className="section-title block mb-2">Affected Workers ({affectedWorkers?.length || 0})</span>
          <div className="flex flex-wrap gap-2">
            {affectedWorkers?.map(wid => (
              <span key={wid} className="text-xs font-medium px-2 py-1 rounded bg-status-attention-bg text-status-attention">
                {wid}
              </span>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-3 border-t border-mine-border">
          <p className="text-xs text-mine-text-secondary italic leading-relaxed">
            Route must be verified by authorized mine personnel before commencing evacuation.
            This is a computed recommendation based on current sensor data and may not account
            for all ground conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
