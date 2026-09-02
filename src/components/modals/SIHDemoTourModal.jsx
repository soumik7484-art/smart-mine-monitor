import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Volume2,
  AlertTriangle,
  Flame,
  Radio,
  Compass,
} from 'lucide-react';

export const SIHDemoTourModal = () => {
  const {
    isSIHTourOpen,
    setIsSIHTourOpen,
    triggerSubsidence,
    triggerCollapse,
    resetToNormal,
    advanceEvacuation,
    setIsEmergencyHUDOpen,
  } = useMine();

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isSIHTourOpen) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'Step 1: Baseline Monitoring & LoRaWAN Strata Telemetry',
      badge: 'NORMAL BASELINE',
      badgeColor: 'bg-status-safe-bg text-status-safe border-status-safe/40',
      action: () => {
        resetToNormal();
        navigate('/overview');
      },
      scriptText:
        '“Good morning esteemed SIH Evaluators. MINEGUARD AI continuously monitors underground strata across Raniganj Seam 3 using 24 low-cost IoT nodes connected via LoRaWAN 868MHz mesh. Right now, all 4 mine zones (A, B, C, D) are in nominal operating state with ground displacement under 2.0 mm and AI subsidence risk at ~18% SAFE.”',
      highlights: [
        '24 Simulated Strata Nodes (LVDT, Clinometers, Geophones, Stress cells)',
        'Underground Positioning System (UWB/BLE/IMU) tracking 8 tagged miners',
        'Composite AI Risk Gauge at SAFE (<35%)',
        'Vector 2D CAD mine map displaying all tunnel segments and ventilation airflow',
      ],
    },
    {
      step: 2,
      title: 'Step 2: Micro-Seismic Strata Subsidence Detection',
      badge: 'AI PREDICTIVE INGESTION',
      badgeColor: 'bg-status-warning-bg text-status-warning border-status-warning/40',
      action: () => {
        triggerSubsidence();
        navigate('/ai-prediction');
      },
      scriptText:
        '“As extraction advances in Zone B, sensors S-07 through S-12 detect abnormal roof displacement (8.4 mm), 3.2° tilt angle, and micro-seismic acoustic emissions. The AI subsidence prediction engine ingests the multi-parameter stream and forecasts a 30-minute deformation curve, escalating the risk tier to WARNING and logging a proactive DGMS alert.”',
      highlights: [
        'Multi-parameter feature ingestion (Roof displacement, velocity, tilt, vibration, stress)',
        '30-minute predictive deformation forecast with 95% confidence bounds',
        'Explainable AI (XAI) feature importance ranking showing dominant factors',
      ],
    },
    {
      step: 3,
      title: 'Step 3: Roof Fall & Tunnel T-12 Collapse',
      badge: 'CODE RED EMERGENCY',
      badgeColor: 'bg-status-critical-bg text-status-critical border-status-critical/50',
      action: () => {
        triggerCollapse('T-12');
        navigate('/mine-map');
      },
      scriptText:
        '“Critical threshold breached! Tunnel T-12 in Zone B collapses with rapid strata displacement. The system engages DGMS Code Red emergency protocol, activates synthesized control-room siren, and immediately assigns an infinite cost penalty (Cost = ∞) to the blocked segment in the mine routing graph.”',
      highlights: [
        'Tunnel T-12 marked COLLAPSED with Infinite Cost penalty in routing graph',
        'Emergency mode engaged with synthesized Web Audio siren',
        'Miners in Zone B flagged for emergency evacuation',
        'Visual hazard pattern rendered across blocked tunnel segment',
      ],
    },
    {
      step: 4,
      title: 'Step 4: Dijkstra Dynamic Safe Evacuation Routing',
      badge: 'INTELLIGENT REROUTE',
      badgeColor: 'bg-status-attention-bg text-status-attention border-status-attention/50',
      action: () => {
        navigate('/emergency');
      },
      scriptText:
        '“Here is the core SIH innovation. Standard routing would send Worker W-003 and W-004 through collapsed tunnel T-12. MINEGUARD AI applies risk penalties: Cost(e) = Distance × W_Risk. The engine dynamically calculates a safe detour path avoiding T-12 and guiding miners via Junction J9 directly toward surface Exit E1 or Refuge Chamber REF-1!”',
      highlights: [
        'Blocked path: J10 → T-12 → J9 (IMPASSABLE)',
        'Calculated safe detour: J10 → J12 → J11 → J9 → J3 → J2 → J1 → Surface Exit E1',
        'Turn-by-turn HUD instructions updated in real time per miner',
      ],
    },
    {
      step: 5,
      title: 'Step 5: Step-by-Step Evacuation & Incident Audit',
      badge: 'SAFE ARRIVAL',
      badgeColor: 'bg-status-safe-bg text-status-safe border-status-safe/40',
      action: () => {
        advanceEvacuation();
        navigate('/incident-history');
      },
      scriptText:
        '“The control room steps workers forward along the computed safe route until all personnel safely reach the surface or refuge station. The entire incident, sensor threshold breach, and routing timeline is automatically archived into the DGMS compliance log.”',
      highlights: [
        'Step-by-step miner advancement along calculated safe trajectory',
        'Automated DGMS compliance and incident log archive',
        'Zero-casualty protocol demonstrated',
      ],
    },
  ];

  const current = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      tourSteps[nextStep].action();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      tourSteps[prevStep].action();
    }
  };

  const handleExecuteCurrent = () => {
    current.action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-mine-surface border border-mine-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mine-border bg-mine-surface-alt px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-status-attention text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-mine-text-primary uppercase tracking-wider">
                SIH Evaluator Guided Demonstration Script
              </h2>
              <p className="text-xs text-mine-text-secondary">
                Smart India Hackathon • Step {current.step} of {tourSteps.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSIHTourOpen(false)}
            className="p-1 text-mine-text-secondary hover:text-mine-text-primary rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-mine-bg">
          {/* Step Badge & Title */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-mine-text-primary">
              {current.title}
            </h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>

          {/* Presentation Script Box */}
          <div className="card p-4 bg-mine-surface border-l-4 border-l-status-attention border-mine-border space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mine-text-secondary flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-status-attention" />
              Presenter Spoken Script (Say This To Judges)
            </span>
            <p className="text-xs italic text-mine-text-primary leading-relaxed">
              {current.scriptText}
            </p>
          </div>

          {/* Key Architectural Innovations Highlighted */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary">
              Technical Verification Checklist
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {current.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-mine-text-primary bg-mine-surface p-2 rounded border border-mine-border">
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-safe flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation & Action Footer */}
        <div className="bg-mine-surface-alt border-t border-mine-border px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border border-mine-border bg-mine-surface text-mine-text-primary hover:bg-mine-surface-alt disabled:opacity-40 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleExecuteCurrent}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface-alt border border-mine-border text-mine-text-primary hover:bg-mine-surface transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-status-attention" />
              Re-Trigger Step {current.step}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < tourSteps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold bg-status-attention text-white hover:opacity-90 transition"
              >
                Proceed to Step {currentStep + 2}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  resetToNormal();
                  setIsSIHTourOpen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold bg-status-safe text-white hover:opacity-90 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finish Tour & Reset Mine
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
