import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMine } from '../../context/MineContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../ui/ErrorBoundary';
import ToastContainer from '../ui/ToastContainer';
import { EmergencyHUDModal } from '../modals/EmergencyHUDModal';
import { SensorSimulatorModal } from '../modals/SensorSimulatorModal';
import { AlertTriangle, X } from 'lucide-react';

export default function AppLayout() {
  const { bannerNotification, setBannerNotification } = useMine();

  return (
    <div className="flex h-screen w-full bg-mine-bg overflow-hidden text-mine-text-primary font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />

        {/* Global Notification Banner */}
        {bannerNotification && (
          <div className="bg-status-attention-bg border-b border-status-attention/40 px-4 py-2 flex items-center justify-between text-xs text-status-attention animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{bannerNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotification(null)}
              className="p-1 text-status-attention hover:opacity-75 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals Layer & Toasts */}
      <EmergencyHUDModal />
      <SensorSimulatorModal />
      <ToastContainer />
    </div>
  );
}
