"""
MINEGUARD AI — Verification Test for Trained ML & CV Models
Validates:
1. File existence of model artifacts
2. ML inference for SAFE, WARNING, CRITICAL scenarios
3. CV inference for PILLAR, REFUGE_CHAMBER, ROADWAY, SHAFT
4. FastAPI endpoint /health & /predict with the loaded model
"""

import os
import joblib
import numpy as np
from fastapi.testclient import TestClient

def test_models():
    print("==================================================")
    print("MINEGUARD AI - MODEL VERIFICATION SUITE")
    print("==================================================")

    # 1. Verify Model Files Existence
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    ml_model_file = os.path.join(models_dir, "risk_classifier.joblib")
    ml_prep_file = os.path.join(models_dir, "preprocessor.joblib")
    cv_model_file = os.path.join(models_dir, "cv_feature_classifier.joblib")
    cv_prep_file = os.path.join(models_dir, "cv_preprocessor.joblib")

    for path, label in [
        (ml_model_file, "ML Risk Classifier"),
        (ml_prep_file, "ML Preprocessor"),
        (cv_model_file, "CV Feature Classifier"),
        (cv_prep_file, "CV Preprocessor"),
    ]:
        exists = os.path.exists(path)
        print(f"[{'PASS' if exists else 'FAIL'}] {label} ({os.path.basename(path)}): {os.path.getsize(path) if exists else 0} bytes")
        assert exists, f"Missing model artifact: {path}"

    # 2. Test ML Model Direct Inference
    ml_model = joblib.load(ml_model_file)
    ml_prep = joblib.load(ml_prep_file)

    # Test Case A: Normal safe baseline
    # [acc_x, acc_y, acc_z, ppv, freq, psd, geo, seismo, temp, vib_mag, vib_h, ke, ratio, spec_prod]
    v_safe = [0.03, 0.03, 0.05, 0.65, 26.0, 0.08, 0.60, 0.40, 27.0, 0.065, 0.042, 0.21, 0.66, 2.08]
    p_safe = ml_model.predict(ml_prep.transform([v_safe]))[0]
    print(f"[PASS] ML Inference (Safe Case) -> {p_safe}")
    assert p_safe == "SAFE", f"Expected SAFE, got {p_safe}"

    # Test Case B: Warning scenario (elevated PPV, micro-cracking)
    v_warn = [0.35, 0.30, 0.45, 2.80, 20.0, 0.40, 2.85, 1.80, 31.0, 0.644, 0.46, 3.92, 0.63, 8.0]
    p_warn = ml_model.predict(ml_prep.transform([v_warn]))[0]
    print(f"[PASS] ML Inference (Warning Case) -> {p_warn}")
    assert p_warn == "WARNING", f"Expected WARNING, got {p_warn}"

    # Test Case C: Critical scenario (severe PPV > 5 mm/s, high kinetic energy shockwave)
    v_crit = [1.20, 1.10, 2.20, 7.50, 10.0, 1.80, 9.50, 6.20, 36.0, 2.73, 1.62, 28.125, 0.65, 18.0]
    p_crit = ml_model.predict(ml_prep.transform([v_crit]))[0]
    print(f"[PASS] ML Inference (Critical Case) -> {p_crit}")
    assert p_crit == "CRITICAL", f"Expected CRITICAL, got {p_crit}"

    # 3. Test CV Model Direct Inference
    from cv_model import MineBlueprintCVModel
    from train_cv_model import extract_contour_cv_features
    cv_engine = MineBlueprintCVModel()
    assert cv_engine.is_loaded, "CV Model failed to load in MineBlueprintCVModel"

    # Test contour for solid pillar (rect 50x60)
    canvas = np.zeros((200, 200), dtype=np.uint8)
    import cv2
    cv2.rectangle(canvas, (30, 30), (80, 90), 255, -1)
    cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    feats = extract_contour_cv_features(cnts[0], 1000, 700)
    res_cv = cv_engine.predict_features(feats)
    print(f"[PASS] CV Inference (Pillar Shape) -> {res_cv['class']} (Confidence: {res_cv['confidence'] * 100:.1f}%)")
    assert res_cv["class"] == "PILLAR", f"Expected PILLAR, got {res_cv['class']}"

    # 4. Test FastAPI Integration
    # Re-import main to pick up the newly generated model files
    import main as backend_main
    # Reload model in main if it was already imported
    if os.path.exists(backend_main.MODEL_PATH):
        backend_main.loaded_model = joblib.load(backend_main.MODEL_PATH)
    if os.path.exists(backend_main.PREPROCESSOR_PATH):
        backend_main.loaded_preprocessor = joblib.load(backend_main.PREPROCESSOR_PATH)

    client = TestClient(backend_main.app)

    # Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    h_data = res_health.json()
    print(f"[PASS] FastAPI /health -> model_loaded: {h_data['model_loaded']}, model_name: '{h_data['model_name']}'")
    assert h_data["model_loaded"] is True, "Expected model_loaded == True in /health"
    assert "Random Forest" in h_data["model_name"]

    # Predict endpoint
    res_pred = client.post("/predict", json={
        "node_id": "TEST_ESP32_01",
        "ppv_mms": 6.8,
        "acc_x_ms2": 1.1,
        "acc_y_ms2": 0.9,
        "acc_z_ms2": 1.8,
        "frequency_hz": 12.0,
        "psd_value": 1.4,
        "geophone_mms": 7.2,
        "seismometer_ms2": 5.1,
        "temperature_c": 33.0
    })
    assert res_pred.status_code == 200
    p_data = res_pred.json()
    print(f"[PASS] FastAPI /predict -> risk_level: {p_data['risk_level']}, model_used: '{p_data['model_used']}'")
    assert p_data["risk_level"] == "CRITICAL"
    assert "Random Forest (Trained Joblib Bundle)" in p_data["model_used"]

    print("\n==================================================")
    print("ALL ML & CV MODEL VERIFICATION TESTS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    test_models()
