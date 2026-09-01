import { NavLink } from 'react-router-dom';

const navItems = [
  {
    name: 'Overview',
    path: '/overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: 'Mine Map',
    path: '/mine-map',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    name: 'Sensor Network',
    path: '/sensor-network',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" />
      </svg>
    ),
  },
  {
    name: 'Risk Analysis',
    path: '/risk-analysis',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    name: 'Worker Safety',
    path: '/worker-safety',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: 'Emergency',
    path: '/emergency',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    name: 'Incident History',
    path: '/incident-history',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    ),
  },
];

export default function Sidebar({ lastSync, emergencyActive }) {
  const syncTime = lastSync instanceof Date
    ? lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : lastSync || '--:--:--';

  return (
    <div className="w-60 flex-shrink-0 bg-mine-surface-alt border-r border-mine-border flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="font-bold text-lg text-mine-text-primary tracking-wide">SMARTMINE</h1>
        <p className="text-xs text-mine-text-secondary tracking-wider mt-0.5">Mine Safety System</p>
      </div>

      <div className="h-px bg-mine-border mx-4" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-mine-bg border-l-[3px] border-status-attention text-mine-text-primary font-medium'
                  : 'text-mine-text-secondary hover:bg-mine-bg/50 border-l-[3px] border-transparent'
              }`
            }
          >
            <span className="relative flex-shrink-0">
              {item.icon}
              {item.name === 'Emergency' && emergencyActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-status-critical rounded-full" />
              )}
            </span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-mine-border px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-safe" />
          <span className="text-xs font-medium text-mine-text-primary">Operational</span>
        </div>
        <p className="text-xs text-mine-text-secondary tabular-nums">
          Last sync: {syncTime}
        </p>
        <button className="text-xs text-mine-text-secondary hover:text-mine-text-primary transition-colors uppercase tracking-wider font-medium">
          Settings
        </button>
        <div
          className="text-[10px] text-mine-text-secondary border border-mine-border rounded px-2 py-1 bg-mine-bg text-center"
          title="Press Ctrl+Shift+E to toggle emergency simulation"
        >
          Ctrl+Shift+E: Simulate Emergency
        </div>
      </div>
    </div>
  );
}
