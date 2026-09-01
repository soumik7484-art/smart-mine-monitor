import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ appState }) {
  const {
    lastSync,
    emergencyState,
    sensorData,
    alerts = [],
    triggerEmergency,
    resetEmergency,
  } = appState || {};

  const overallCondition = sensorData?.overallCondition || 'SAFE';
  const emergencyActive = emergencyState?.active || false;

  return (
    <div className="flex h-screen w-full bg-mine-bg overflow-hidden text-mine-text-primary font-sans">
      <Sidebar
        lastSync={lastSync}
        emergencyActive={emergencyActive}
        onTriggerEmergency={triggerEmergency}
        onResetEmergency={resetEmergency}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          lastSync={lastSync}
          overallCondition={overallCondition}
          alertCount={alerts.length}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={appState} />
        </main>
      </div>
    </div>
  );
}
