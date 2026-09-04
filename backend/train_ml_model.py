"""
MINEGUARD AI — Hardware-Aligned ML Strata Subsidence & Ground Vibration Model Trainer
Trains a Random Forest Classifier + Scaler Preprocessor for the 14-feature
hardware telemetry pipeline (compatible with ESP32 / LoRa gateway telemetry).

Outputs:
- backend/models/risk_classifier.joblib
- backend/models/preprocessor.joblib
- backend/models/ml_model_metadata.json
"""

import os
import math
import json
from datetime import datetime, timezone
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "risk_classifier.joblib")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "ml_model_metadata.json")

FEATURE_NAMES = [
    "acc_x_ms2",
    "acc_y_ms2",
    "acc_z_ms2",
    "ppv_mms",
    "frequency_hz",
    "psd_value",
    "geophone_mms",
    "seismometer_ms2",
    "temperature_c",
    "vibration_magnitude_ms2",
    "vibration_horizontal_ms2",
    "kinetic_energy_proxy",
    "accel_to_velocity_ratio",
    "spectral_power_product",
]

CLASSES = ["SAFE", "WARNING", "CRITICAL"]


def generate_synthetic_telemetry(n_samples_per_class: int = 2500, random_seed: int = 42):
    """
    Generates realistic, physically-grounded geotechnical telemetry data
    adhering to Indian Directorate General of Mines Safety (DGMS) standards
    and subsurface rock mechanics principles.
    """
    np.random.seed(random_seed)
    data = []
    labels = []

    # ──────────────────────────────────────────────────────────────────────────
    # 1. SAFE Operational Regime (Baseline coal mining)
    # - PPV < 2.0 mm/s (DGMS safe baseline < 2 mm/s for underground structures)
    # - Low dynamic accelerations (< 0.2 m/s2)
    # - Low kinetic energy proxy (< 2.0)
    # - Ambient temperature 24 - 32 C
    # - Steady dominant frequencies (18 - 45 Hz)
    # ──────────────────────────────────────────────────────────────────────────
    n_safe = n_samples_per_class
    ppv_safe = np.random.uniform(0.10, 1.85, n_safe)
    acc_x_safe = np.random.uniform(0.01, 0.12, n_safe)
    acc_y_safe = np.random.uniform(0.01, 0.12, n_safe)
    acc_z_safe = np.random.uniform(0.02, 0.15, n_safe)
    freq_safe = np.random.uniform(18.0, 48.0, n_safe)
    psd_safe = np.random.uniform(0.02, 0.19, n_safe)
    geo_safe = ppv_safe * np.random.uniform(0.75, 1.15, n_safe)
    seismo_safe = np.random.uniform(0.10, 0.95, n_safe)
    temp_safe = np.random.uniform(25.0, 31.5, n_safe)

    for i in range(n_safe):
        x, y, z = acc_x_safe[i], acc_y_safe[i], acc_z_safe[i]
        ppv = ppv_safe[i]
        freq = freq_safe[i]
        psd = psd_safe[i]
        geo = geo_safe[i]
        seismo = seismo_safe[i]
        temp = temp_safe[i]

        vib_mag = math.sqrt(x**2 + y**2 + z**2)
        vib_horiz = math.sqrt(x**2 + y**2)
        ke_proxy = 0.5 * (ppv ** 2)
        acc_vel_ratio = abs(seismo) / (abs(geo) + 1e-4)
        spec_prod = psd * freq

        row = [x, y, z, ppv, freq, psd, geo, seismo, temp,
               vib_mag, vib_horiz, ke_proxy, acc_vel_ratio, spec_prod]
        data.append(row)
        labels.append("SAFE")

    # ──────────────────────────────────────────────────────────────────────────
    # 2. WARNING Operational Regime (Micro-seismic activity / Strata dilation)
    # - PPV 2.0 to 3.95 mm/s (Moderate bed separation / face advance blasting)
    # - Moderate kinetic energy (2.0 to 7.8)
    # - Elevated acceleration (0.25 to 0.75 m/s2)
    # - Lowering dominant frequency (10 to 30 Hz as fractures open)
    # - PSD energy 0.20 to 0.65
    # ──────────────────────────────────────────────────────────────────────────
    n_warn = n_samples_per_class
    ppv_warn = np.random.uniform(2.05, 3.92, n_warn)
    acc_x_warn = np.random.uniform(0.12, 0.45, n_warn)
    acc_y_warn = np.random.uniform(0.12, 0.45, n_warn)
    acc_z_warn = np.random.uniform(0.20, 0.70, n_warn)
    freq_warn = np.random.uniform(12.0, 32.0, n_warn)
    psd_warn = np.random.uniform(0.22, 0.65, n_warn)
    geo_warn = ppv_warn * np.random.uniform(0.85, 1.25, n_warn)
    seismo_warn = np.random.uniform(1.10, 2.50, n_warn)
    temp_warn = np.random.uniform(28.0, 37.0, n_warn)

    for i in range(n_warn):
        x, y, z = acc_x_warn[i], acc_y_warn[i], acc_z_warn[i]
        ppv = ppv_warn[i]
        freq = freq_warn[i]
        psd = psd_warn[i]
        geo = geo_warn[i]
        seismo = seismo_warn[i]
        temp = temp_warn[i]

        vib_mag = math.sqrt(x**2 + y**2 + z**2)
        vib_horiz = math.sqrt(x**2 + y**2)
        ke_proxy = 0.5 * (ppv ** 2)
        acc_vel_ratio = abs(seismo) / (abs(geo) + 1e-4)
        spec_prod = psd * freq

        row = [x, y, z, ppv, freq, psd, geo, seismo, temp,
               vib_mag, vib_horiz, ke_proxy, acc_vel_ratio, spec_prod]
        data.append(row)
        labels.append("WARNING")

    # ──────────────────────────────────────────────────────────────────────────
    # 3. CRITICAL Operational Regime (Catastrophic Roof Fall / Caving Precursor)
    # - PPV >= 4.0 mm/s (Severe shockwave, up to 16 mm/s)
    # - High kinetic energy (>= 8.0 up to 120.0)
    # - Severe 3D acceleration (>= 1.5 m/s2)
    # - Low-frequency seismic ground roll (4.0 to 18.0 Hz)
    # - High PSD energy (0.75 to 3.50)
    # ──────────────────────────────────────────────────────────────────────────
    n_crit = n_samples_per_class
    ppv_crit = np.random.uniform(4.05, 14.50, n_crit)
    acc_x_crit = np.random.uniform(0.50, 2.80, n_crit)
    acc_y_crit = np.random.uniform(0.50, 2.80, n_crit)
    acc_z_crit = np.random.uniform(0.90, 4.50, n_crit)
    freq_crit = np.random.uniform(4.0, 18.0, n_crit)
    psd_crit = np.random.uniform(0.75, 3.80, n_crit)
    geo_crit = ppv_crit * np.random.uniform(1.10, 1.60, n_crit)
    seismo_crit = np.random.uniform(2.80, 12.00, n_crit)
    temp_crit = np.random.uniform(31.0, 46.0, n_crit)

    for i in range(n_crit):
        x, y, z = acc_x_crit[i], acc_y_crit[i], acc_z_crit[i]
        ppv = ppv_crit[i]
        freq = freq_crit[i]
        psd = psd_crit[i]
        geo = geo_crit[i]
        seismo = seismo_crit[i]
        temp = temp_crit[i]

        vib_mag = math.sqrt(x**2 + y**2 + z**2)
        vib_horiz = math.sqrt(x**2 + y**2)
        ke_proxy = 0.5 * (ppv ** 2)
        acc_vel_ratio = abs(seismo) / (abs(geo) + 1e-4)
        spec_prod = psd * freq

        row = [x, y, z, ppv, freq, psd, geo, seismo, temp,
               vib_mag, vib_horiz, ke_proxy, acc_vel_ratio, spec_prod]
        data.append(row)
        labels.append("CRITICAL")

    X = np.array(data, dtype=np.float64)
    y = np.array(labels, dtype=object)
    return X, y


def train_ml_pipeline():
    print("=" * 65)
    print("MINEGUARD AI - TRAINING HARDWARE-ALIGNED SUBSIDENCE ML MODEL")
    print("=" * 65)

    print("\n[1/5] Generating physically-grounded geotechnical telemetry...")
    X, y = generate_synthetic_telemetry(n_samples_per_class=3000, random_seed=42)
    print(f"Total samples: {len(X)} across classes {CLASSES}")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Preprocessor
    print("\n[2/5] Fitting StandardScaler preprocessor across 14 features...")
    preprocessor = StandardScaler()
    X_train_scaled = preprocessor.fit_transform(X_train)
    X_test_scaled = preprocessor.transform(X_test)

    # Model
    print("\n[3/5] Training Random Forest Classifier (n_estimators=150, max_depth=16)...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train_scaled, y_train)

    # Evaluation
    print("\n[4/5] Evaluating model performance on hold-out validation set...")
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4, output_dict=True)
    cm = confusion_matrix(y_test, y_pred, labels=CLASSES).tolist()

    print(f"Validation Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    for cls in CLASSES:
        metrics = report.get(cls, {})
        print(f" - {cls:8s}: Precision={metrics.get('precision', 0):.4f}, Recall={metrics.get('recall', 0):.4f}, F1={metrics.get('f1-score', 0):.4f}")

    # Feature importances
    feature_importances = dict(zip(FEATURE_NAMES, [round(float(v), 5) for v in clf.feature_importances_]))
    sorted_features = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
    print("\nTop 5 Most Dominant Geomechanical Features (XAI):")
    for feat, imp in sorted_features[:5]:
        print(f" - {feat:25s}: {imp * 100:.2f}% contribution")

    # Persist artifacts
    print(f"\n[5/5] Saving model bundles to {MODELS_DIR}...")
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    print(f" - Saved model: {MODEL_PATH}")
    print(f" - Saved preprocessor: {PREPROCESSOR_PATH}")

    metadata = {
        "model_name": "Random Forest (SIH Hardware-Aligned)",
        "architecture": "RandomForestClassifier",
        "n_estimators": 150,
        "max_depth": 16,
        "features_count": 14,
        "feature_names": FEATURE_NAMES,
        "classes": list(clf.classes_),
        "accuracy": round(acc, 4),
        "classification_report": report,
        "confusion_matrix": cm,
        "feature_importances": feature_importances,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f" - Saved metadata: {METADATA_PATH}")

    print("\n[OK] ML MODEL TRAINING COMPLETED SUCCESSFULLY!")
    return metadata


if __name__ == "__main__":
    train_ml_pipeline()
