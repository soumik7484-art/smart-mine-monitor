import StatusBadge from '../ui/StatusBadge';

export default function EmergencyBanner({ emergencyState }) {
  if (!emergencyState?.active) {
    return (
      <div className="card border-status-safe/30">
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-safe-bg mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D8A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-status-safe mb-1">SYSTEM READY</h2>
          <p className="text-sm text-mine-text-secondary">No active emergency. All systems operating normally.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-2 border-status-critical">
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded flex items-center justify-center bg-status-critical-bg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#C4362E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.57 2.44L1.18 15a2 2 0 001.72 3h14.2a2 2 0 001.72-3L11.43 2.44a2 2 0 00-3.46 0z" fill="#FDECEB" />
                <line x1="10" y1="7" x2="10" y2="11" />
                <circle cx="10" cy="14" r="0.5" fill="#C4362E" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-status-critical">EMERGENCY ACTIVE</h2>
              <StatusBadge status="CRITICAL" />
            </div>

            <p className="text-sm font-semibold text-mine-text-primary mb-1">
              {emergencyState.section}
            </p>
            <p className="text-sm text-mine-text-secondary">
              {emergencyState.description}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-4">
              <div>
                <span className="text-xs text-mine-text-secondary uppercase tracking-wider">Affected Workers</span>
                <p className="text-lg font-semibold tabular-nums text-status-critical">
                  {emergencyState.affectedWorkers?.length || 0}
                </p>
              </div>
              <div>
                <span className="text-xs text-mine-text-secondary uppercase tracking-wider">Blocked Tunnel</span>
                <p className="text-sm font-semibold text-mine-text-primary">
                  {emergencyState.blockedTunnels?.length > 0
                    ? emergencyState.blockedTunnels.map(t => t.replace('_', ' → ')).join(', ')
                    : 'None'}
                </p>
              </div>
              <div>
                <span className="text-xs text-mine-text-secondary uppercase tracking-wider">Triggered</span>
                <p className="text-sm font-semibold tabular-nums text-mine-text-primary">
                  {emergencyState.triggeredAt
                    ? new Date(emergencyState.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
