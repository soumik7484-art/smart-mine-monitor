import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MineProvider } from './context/MineContext';
import AppLayout from './components/layout/AppLayout';
import Overview from './pages/Overview';
import MineMapPage from './pages/MineMap';
import SensorNetwork from './pages/SensorNetwork';
import AIPredictionPage from './pages/AIPredictionPage';
import RiskAnalysis from './pages/RiskAnalysis';
import WorkerSafety from './pages/WorkerSafety';
import Emergency from './pages/Emergency';
import IncidentHistory from './pages/IncidentHistory';

export default function App() {
  return (
    <MineProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/mine-map" element={<MineMapPage />} />
          <Route path="/sensor-network" element={<SensorNetwork />} />
          <Route path="/ai-prediction" element={<AIPredictionPage />} />
          <Route path="/risk-analysis" element={<RiskAnalysis />} />
          <Route path="/worker-safety" element={<WorkerSafety />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/incident-history" element={<IncidentHistory />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </MineProvider>
  );
}
