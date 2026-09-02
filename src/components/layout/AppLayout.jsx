import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMine } from '../../context/MineContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../ui/ErrorBoundary';
import ToastContainer from '../ui/ToastContainer';
import { EmergencyHUDModal } from '../modals/EmergencyHUDModal';
import { SensorSimulatorModal } from '../modals/SensorSimulatorModal';
import { AlertTriangle, X, Menu } from 'lucide-react';

export default function AppLayout() {
  const { bannerNotification, setBannerNotification, isSidebarOpen, setIsSidebarOpen } = useMine();

  return (
    <div className="flex h-screen w-full bg-mine-bg overflow-hidden text-mine-text-primary font-sans">
      {/* Overlay Sidebar Drawer (not in flex flow) */}
      <Sidebar />

      {/* Main content — full width now that sidebar is overlaid */}
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

      {/* ── Floating Navigation FAB ────────────────────────────────────────
          Fixed bottom-left; glows on emergency mode.
      ──────────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle navigation"
        title="Open Navigation"
        className={`fixed bottom-6 left-6 z-30 flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full shadow-lg
          border transition-all duration-200 select-none
          ${isSidebarOpen
            ? 'bg-mine-surface border-mine-border text-mine-text-secondary'
            : 'bg-mine-surface border-mine-border text-mine-text-primary hover:border-mine-text-secondary hover:shadow-xl active:scale-95'
          }
        `}
      >
        <span className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`}>
          <Menu className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold tracking-wide">
          {isSidebarOpen ? 'Close' : 'Navigate'}
        </span>
        {/* Live indicator pip */}
        <span className="w-1.5 h-1.5 rounded-full bg-status-safe animate-pulse flex-shrink-0" />
      </button>

      {/* Global Modals Layer & Toasts */}
      <EmergencyHUDModal />
      <SensorSimulatorModal />
      <ToastContainer />
    </div>
  );
}
