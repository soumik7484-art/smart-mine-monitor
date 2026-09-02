# 🛡️ MINEGUARD AI
**AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction & Intelligent Emergency Evacuation System for Underground Coal Mines in India**

*Smart India Hackathon (SIH) Working Demonstration Prototype*

---

## 📋 1. Project Overview & Problem Statement

### The Problem in Indian Underground Coal Mines
Underground coal mining (e.g. in **ECL Raniganj**, **BCCL Jharia**, **SCCL Godavari Valley**, **SECL Korba**) is inherently susceptible to strata subsidence, catastrophic roof falls, and goaf caving incidents. Conventional methods rely on manual tell-tales and periodic visual inspections, which fail to detect micro-seismic pre-collapse strata movements.

Furthermore, during an emergency collapse or gas surge:
- **Conventional GPS does NOT work underground** due to hundreds of meters of solid rock overburden.
- **Standard evacuation routes often lead miners directly into collapsing or hazardous tunnel intersections.**
- **Mine control rooms lack real-time visibility into individual miner locations and dynamic tunnel safety states.**

### The Solution: MINEGUARD AI
MINEGUARD AI is an end-to-end real-time mine safety platform designed to:
1. **Continuously monitor strata deformation** using low-cost IoT sensor nodes (LVDT extensometers, biaxial tiltmeters, 14Hz geophones, hydraulic pressure cells).
2. **Predict subsidence risk up to 30 minutes in advance** using AI strata velocity forecasting with 95% confidence bounds.
3. **Localize miners subsurface** using an **Underground Positioning System (UPS)** based on UWB (Ultra-Wideband), BLE mesh, and helmet IMU dead-reckoning.
4. **Compute the Shortest SAFE Evacuation Route** using graph-based risk penalty Dijkstra algorithms that dynamically avoid collapsed tunnels in real time.

---

## 🏗️ 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                        UNDERGROUND COAL MINE ENVIRONMENT                          |
+-----------------------------------------------------------------------------------+
|  [Roof LVDT Sensors]  [BNO055 Tiltmeters]  [14Hz Geophones]  [Hydraulic Load Cells]|
|         │                                                                         |
|         ▼ (RS-485 / I2C)                                                          |
|  [ESP32 IoT Edge Nodes]                                                           |
|         │                                                                         |
|         ▼ (LoRa / LoRaWAN 868MHz Subsurface Mesh)                                 |
|  [Underground LoRa Repeater Gateway]                                              |
|         │                                                                         |
|  [UWB Anchors DWM1000] ──(Time-of-Flight)──> [Miner Smart Helmet / UPS Tag]       |
+───────────────────────────────────┼───────────────────────────────────────────────+
                                    │ (Optical Fiber Shaft Trunk / Ethernet)
                                    ▼
+-----------------------------------------------------------------------------------+
|                        SURFACE MINE CONTROL ROOM SERVER                           |
+-----------------------------------------------------------------------------------+
|  [Real-Time State Machine Engine]  ◄──►  [Dijkstra Shortest SAFE Path Engine]     |
|  [AI Strata Subsidence Predictor]  ◄──►  [Explainable AI (XAI) Ranking Engine]    |
+-----------------------------------------------------------------------------------+
                                    │
                                    ▼
+-----------------------------------------------------------------------------------+
|                     MINEGUARD AI COMMAND CENTER DASHBOARD                         |
+-----------------------------------------------------------------------------------+
|  - Real-Time KPI Cards (Mine Status, Active Nodes 24/24, Miners 8, AI Risk Score) |
|  - Live 2D Vector Underground Mine Map (Coal Pillars, Goaf, Airflow, UWB Anchors) |
|  - Strata Waveform Charts (Displacement, Tilt, Vibration, Stress)                |
|  - Intelligent Evacuation Route Visualizer with Dynamic Safe Detour Rerouting     |
|  - Full-Screen Red Alert Emergency Mode HUD & Broadcast Dispatcher                |
|  - SIH Demonstration Scenario Panel (1-Click Scenario Injectors)                  |
|  - Synthetic Web Audio Siren & Warning Synthesizer                                |
+-----------------------------------------------------------------------------------+
```

---

## 🧮 3. Core Innovation: Shortest SAFE Route Algorithm

### Graph Model
- **Nodes ($V$)**: Junctions (J1...J14), Surface Incline Exits (E1, E2), Emergency Shafts (E3, E4), and Refuge Chamber (REF-1).
- **Edges ($E$)**: Tunnel sections with length $d_e$, risk level $R_e$, and availability status $S_e$.

### Dynamic Penalty Cost Function
$$\text{Cost}(e) = \begin{cases} 
d_e \times 1.0 & \text{if } R_e = \text{SAFE} \\ 
d_e \times 2.5 & \text{if } R_e = \text{CAUTION} \\ 
d_e \times 7.0 & \text{if } R_e = \text{WARNING} \\ 
\infty & \text{if } R_e = \text{CRITICAL or COLLAPSED} 
\end{cases}$$

When a tunnel collapses or experiences critical subsidence, its edge cost becomes $\infty$ and is immediately excised from the pathfinding graph, dynamically computing a safe detour around the hazard.

---

## 🎯 4. Live Demonstration Script for SIH Judges

### Step 1: Initial Baseline Monitoring (Dashboard)
1. Open the dashboard at `/overview`.
2. Observe top KPI cards: Mine Status **● MONITORING**, Active Sensors **24 / 24**, Workers Underground **8**, AI Risk Score **~18% SAFE**.
3. Inspect the live 2D underground coal mine vector map showing all 4 zones (A, B, C, D), coal pillars, ventilation airflow, UWB anchors, and active miner markers.

### Step 2: Simulate Increasing Strata Subsidence
1. In the top SIH Demo Bar, click `[ ⚠️ SIMULATE SUBSIDENCE ]`.
2. Notice Zone B sensor telemetry ramp up (displacement jumps, tilt increases, micro-seismic geophone surges).
3. Navigate to **AI Prediction & XAI** (`/ai-prediction`): observe the AI risk gauge climb to **WARNING**, the 30-minute predictive curve approaching the critical threshold with 95% confidence bounds, and the Explainable AI (XAI) dominant factor weights.

### Step 3: Trigger Catastrophic Collapse & Dynamic Safe Rerouting (Core Innovation)
1. In the demo bar, click `[ 🚨 COLLAPSE T-12 & REROUTE ]`.
2. Observe the synchronized reaction:
   - Tunnel T-12 turns into animated hazard stripes (**COLLAPSED / IMPASSABLE**).
   - Synthesized Web Audio siren sounds in control room.
   - Red Alert banner announces: `🚨 ROUTE UPDATED: Previous route through T-12 is unsafe. Alternative safe evacuation route calculated.`
   - Worker routes dynamically detour through safe crosscuts to **Surface Exit E1**.
   - Full-Screen **Red Alert Emergency HUD** opens with turn-by-turn guidance for every miner.

### Step 4: Emergency Dispatch & Step Evacuation
1. In the Emergency HUD, click **"Dispatch SMS & Tags"** to simulate broadcasting evacuation coordinates to smart helmet tags.
2. Click **"Silence Siren"** to mute audio.
3. Click `[ ⚡ Step Evac ]` in the top bar to advance evacuating miners step-by-step along the calculated safe path until safe exit.

### Step 5: Reset Simulation
1. Click `[ 🟢 NORMAL MINE ]` to reset all 24 sensors, tunnels, and routes back to normal operating baseline.

---

## 🚀 5. Local Setup & Running

```bash
# Clone the repository
git clone https://github.com/soumik7484-art/smart-mine-monitor.git
cd smart-mine-monitor

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Application will run locally on `http://localhost:3000/`.

---

## 🎨 6. Industrial Control Room Design Standards
- Warm industrial palette: `#F5F2EC` (Background), `#FFFFFF` (Card surface), `#EEEBE4` (Alt surface), `#292722` (Text), `#D8D3CA` (Borders).
- Standard status indicators: Green (`#2D8A4E`), Amber (`#C4820E`), Red (`#C4362E`), Orange (`#D97706`).
- Tabular figures and Inter typography for precise telemetry reading.
