# SmartMine — Industrial Mine Subsidence & Safety Monitoring System

SmartMine is a production-quality, industrial-grade control-room monitoring and emergency evacuation system designed for underground mining operations.

---

## 🏗️ System Architecture & Features

### 1. **Mine Operations Overview (`/overview`)**
- Real-time ground stability and environmental risk scoring.
- Live status indicators: Overall condition, active telemetry nodes (24/28), workers underground (17), active alerts, and system health (98.7%).
- Live sensor trends for displacement (mm), tilt (°), vibration (g), temperature (°C), and gas concentrations.
- Active alerts table with severity grading and investigation status.

### 2. **2D Schematic Mine Map (`/mine-map`)**
- Vector-rendered 2D engineering schematic of main and branch tunnels (Sections A, B, C, D).
- Dynamic sensor node telemetry visualization (Normal / Warning / Critical / Offline).
- Real-time worker position tracking with evacuation hazard overlays.
- Dynamic BFS route calculation for emergency evacuation when tunnels are obstructed.
- Interactive node telemetry inspection panel.

### 3. **Sensor Network Monitor (`/sensor-network`)**
- Complete grid monitoring across all 28 subsidence and environmental sensor nodes.
- Filterable by operational state (`All`, `Safe`, `Warning`, `Critical`, `Offline`).
- Sortable tabular telemetry with instant expandable historical sparkline charts.

### 4. **Prototype Risk Engine (`/risk-analysis`)**
- Deterministic multi-sensor correlation and rate-of-change analysis engine.
- Weighted factor scoring: Ground displacement, tilt variation, vibration, neighboring node correlation, and rate-of-change.
- 30-minute rolling risk timeline.

### 5. **Worker Safety & Helmet Telemetry (`/worker-safety`)**
- Underground personnel tracking and smart helmet connection monitoring.
- Telemetry streams for body temperature, helmet humidity, movement activity, and distress states.

### 6. **Emergency Center & Evacuation System (`/emergency`)**
- Fast-action emergency response dashboard.
- Dynamic obstacle detection, hazard perimeter mapping, and computed evacuation pathways.
- Keyboard shortcut: Press `Ctrl + Shift + E` to simulate an anomaly, risk escalation, tunnel blockage, and route recalculation.

### 7. **Incident History (`/incident-history`)**
- Historical event log with multi-parameter filtering (Severity, Search queries, Date ranges).

---

## 🎨 Industrial Design Language
- **Warm industrial palette**: `#F5F2EC` (Background), `#FFFFFF` (Surface), `#EEEBE4` (Secondary), `#292722` (Primary Text), `#6F6A61` (Secondary Text), `#D8D3CA` (Borders).
- **Typography**: Inter with tabular numerals for precision data reading.
- **Strictly No**: Dark mode, neon glows, glassmorphism, or consumer SaaS clutter.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/soumik7484-art/smart-mine-monitor.git
cd smart-mine-monitor

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be available at `http://localhost:3000/`.

---

## 📦 Production Build

```bash
# Compile optimized bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🌐 Deployment
This project is configured with GitHub Actions to automatically build and deploy to **GitHub Pages** upon every push to the `main` branch.
