"""
MINEGUARD AI — Computer Vision Mine Blueprint Structure & Contour Classifier
Trains an automated CV Feature Classifier to classify detected blueprint contours
into structural mine components:
- PILLAR (Solid coal extraction pillars)
- REFUGE_CHAMBER (Subsurface emergency refuge rooms / machinery stations)
- ROADWAY (Underground galleries, main haulage entries, crosscuts)
- SHAFT (Surface incline portals & vertical shafts)
- NOISE (CAD borders, grid ticks, text annotations, isolated speckles)

Outputs:
- backend/models/cv_feature_classifier.joblib
- backend/models/cv_preprocessor.joblib
- backend/models/cv_model_metadata.json
"""

import os
import math
import json
from datetime import datetime, timezone
import numpy as np
import cv2
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

from cv_engine import load_blueprint_image, preprocess_blueprint

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CV_MODEL_PATH = os.path.join(MODELS_DIR, "cv_feature_classifier.joblib")
CV_PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "cv_preprocessor.joblib")
CV_METADATA_PATH = os.path.join(MODELS_DIR, "cv_model_metadata.json")

CV_FEATURE_NAMES = [
    "area",
    "perimeter",
    "aspect_ratio",
    "extent",
    "solidity",
    "compactness",
    "rect_diff",
    "hu_moment_1",
    "hu_moment_2",
    "hu_moment_3",
    "hu_moment_4",
    "hu_moment_5",
    "hu_moment_6",
    "hu_moment_7",
    "norm_w",
    "norm_h",
    "norm_area",
]

CV_CLASSES = ["PILLAR", "REFUGE_CHAMBER", "ROADWAY", "SHAFT", "NOISE"]


def extract_contour_cv_features(cnt, img_w: int = 1000, img_h: int = 700):
    """
    Extracts 17 invariant morphological & shape descriptors from an OpenCV contour.
    """
    area = float(cv2.contourArea(cnt))
    perimeter = float(cv2.arcLength(cnt, True))
    rx, ry, rw, rh = cv2.boundingRect(cnt)
    
    aspect_ratio = float(rw) / float(rh) if rh > 0 else 1.0
    bounding_box_area = float(rw * rh)
    extent = area / (bounding_box_area + 1e-5)
    
    hull = cv2.convexHull(cnt)
    hull_area = float(cv2.contourArea(hull))
    solidity = area / (hull_area + 1e-5)
    
    compactness = (4.0 * math.pi * area) / ((perimeter ** 2) + 1e-5)
    rect_diff = abs(area - bounding_box_area) / (bounding_box_area + 1e-5)

    # 7 Hu Moments (log transformed for numerical stability)
    moments = cv2.moments(cnt)
    hu_raw = cv2.HuMoments(moments)
    hu_feats = []
    for h in hu_raw:
        val = h[0]
        if val != 0:
            hu_feats.append(-1.0 * math.copysign(1.0, val) * math.log10(abs(val)))
        else:
            hu_feats.append(0.0)

    norm_w = float(rw) / float(img_w)
    norm_h = float(rh) / float(img_h)
    norm_area = area / float(img_w * img_h)

    return [
        area,
        perimeter,
        aspect_ratio,
        extent,
        solidity,
        compactness,
        rect_diff,
        hu_feats[0],
        hu_feats[1],
        hu_feats[2],
        hu_feats[3],
        hu_feats[4],
        hu_feats[5],
        hu_feats[6],
        norm_w,
        norm_h,
        norm_area,
    ]


def build_cv_dataset():
    """
    Collects contours from existing blueprints and augments them
    with synthetic CAD geometry to train a robust multi-class CV classifier.
    """
    X_samples = []
    y_labels = []

    # 1. Mine authentic blueprints from project assets
    asset_paths = [
        os.path.join(os.path.dirname(__file__), "..", "public", "assets", "sample_mine_blueprint.jpg"),
        os.path.join(os.path.dirname(__file__), "..", "public", "assets", "mine_blueprint_b.png"),
        os.path.join(os.path.dirname(__file__), "test_assets", "mine_blueprint_b.png"),
    ]

    for path in asset_paths:
        if os.path.exists(path):
            with open(path, "rb") as f:
                img_bytes = f.read()
            img_bgr, w, h, _, _ = load_blueprint_image(img_bytes, os.path.basename(path))
            binary, _, _ = preprocess_blueprint(img_bgr)
            contours, _ = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            
            for cnt in contours:
                area = cv2.contourArea(cnt)
                feats = extract_contour_cv_features(cnt, w, h)
                rx, ry, rw, rh = cv2.boundingRect(cnt)
                solidity = feats[4]
                extent = feats[3]
                aspect = feats[2]

                if area < 300:
                    label = "NOISE"
                elif area > 10000 and solidity > 0.85:
                    label = "REFUGE_CHAMBER"
                elif 1500 <= area <= 7500 and extent > 0.80 and 0.5 <= aspect <= 1.8:
                    label = "PILLAR"
                elif aspect > 3.0 or aspect < 0.33:
                    label = "ROADWAY"
                elif 500 <= area <= 2000 and 0.7 <= aspect <= 1.4:
                    label = "SHAFT"
                else:
                    label = "NOISE"

                X_samples.append(feats)
                y_labels.append(label)

    # 2. Augment with synthetic geometric CAD structures across all 5 classes
    np.random.seed(42)
    n_synth_per_class = 800

    # Synthetic PILLARS (Coal pillars: solid rectangular/square blocks, high solidity > 0.90)
    for _ in range(n_synth_per_class):
        pw = int(np.random.uniform(35, 75))
        ph = int(np.random.uniform(35, 85))
        canvas = np.zeros((200, 200), dtype=np.uint8)
        # Add slight jitter/rounding
        cv2.rectangle(canvas, (30, 30), (30 + pw, 30 + ph), 255, -1)
        cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            X_samples.append(extract_contour_cv_features(cnts[0], 1000, 700))
            y_labels.append("PILLAR")

    # Synthetic REFUGE CHAMBERS (Large underground rooms: high area, high solidity)
    for _ in range(n_synth_per_class):
        cw = int(np.random.uniform(90, 160))
        ch = int(np.random.uniform(80, 140))
        canvas = np.zeros((300, 300), dtype=np.uint8)
        cv2.rectangle(canvas, (40, 40), (40 + cw, 40 + ch), 255, -1)
        cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            X_samples.append(extract_contour_cv_features(cnts[0], 1000, 700))
            y_labels.append("REFUGE_CHAMBER")

    # Synthetic ROADWAY TUNNELS (Linear galleries: high aspect ratio, low solidity or thin)
    for _ in range(n_synth_per_class):
        is_horiz = np.random.choice([True, False])
        canvas = np.zeros((400, 400), dtype=np.uint8)
        if is_horiz:
            rw = int(np.random.uniform(150, 350))
            rh = int(np.random.uniform(10, 25))
        else:
            rw = int(np.random.uniform(10, 25))
            rh = int(np.random.uniform(150, 350))
        cv2.rectangle(canvas, (20, 20), (20 + rw, 20 + rh), 255, -1)
        cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            X_samples.append(extract_contour_cv_features(cnts[0], 1000, 700))
            y_labels.append("ROADWAY")

    # Synthetic SHAFTS (Vertical / Incline portals: circular or concentric squares)
    for _ in range(n_synth_per_class):
        canvas = np.zeros((200, 200), dtype=np.uint8)
        radius = int(np.random.uniform(16, 32))
        cv2.circle(canvas, (100, 100), radius, 255, -1)
        cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            X_samples.append(extract_contour_cv_features(cnts[0], 1000, 700))
            y_labels.append("SHAFT")

    # Synthetic NOISE (Tiny fragments, CAD border lines, text artifacts)
    for _ in range(n_synth_per_class):
        canvas = np.zeros((200, 200), dtype=np.uint8)
        noise_type = np.random.choice(["speckle", "thin_line", "polygon"])
        if noise_type == "speckle":
            nw = int(np.random.uniform(2, 12))
            nh = int(np.random.uniform(2, 12))
            cv2.rectangle(canvas, (50, 50), (50 + nw, 50 + nh), 255, -1)
        elif noise_type == "thin_line":
            cv2.line(canvas, (10, 10), (180, 10), 255, 1)
        else:
            pts = np.array([[30, 30], [50, 45], [40, 70], [20, 50]], np.int32)
            cv2.fillPoly(canvas, [pts], 255)

        cnts, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            X_samples.append(extract_contour_cv_features(cnts[0], 1000, 700))
            y_labels.append("NOISE")

    return np.array(X_samples, dtype=np.float64), np.array(y_labels, dtype=object)


def train_cv_pipeline():
    print("=" * 65)
    print("MINEGUARD AI - TRAINING COMPUTER VISION CONTOUR CLASSIFIER")
    print("=" * 65)

    print("\n[1/5] Extracting CV contour descriptors & augmenting CAD variations...")
    X, y = build_cv_dataset()
    print(f"Total contour samples: {len(X)}")
    unique_classes, counts = np.unique(y, return_counts=True)
    for uc, count in zip(unique_classes, counts):
        print(f" - {uc:16s}: {count:5d} samples")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\nTraining set: {len(X_train)} | Holdout test set: {len(X_test)}")

    # Preprocessor
    print("\n[2/5] Fitting CV StandardScaler across 17 morphological features...")
    preprocessor = StandardScaler()
    X_train_scaled = preprocessor.fit_transform(X_train)
    X_test_scaled = preprocessor.transform(X_test)

    # Train Random Forest Classifier
    print("\n[3/5] Training Random Forest Contour Classifier (n_estimators=120)...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_split=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train_scaled, y_train)

    # Evaluate
    print("\n[4/5] Evaluating Computer Vision model on holdout set...")
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4, output_dict=True)
    cm = confusion_matrix(y_test, y_pred, labels=CV_CLASSES).tolist()

    print(f"Contour Classification Accuracy: {acc * 100:.2f}%")
    print("\nClass Performance Breakdown:")
    for cls in CV_CLASSES:
        metrics = report.get(cls, {})
        print(f" - {cls:16s}: Precision={metrics.get('precision', 0):.4f}, Recall={metrics.get('recall', 0):.4f}, F1={metrics.get('f1-score', 0):.4f}")

    # Feature Importance
    importances = dict(zip(CV_FEATURE_NAMES, [round(float(v), 5) for v in clf.feature_importances_]))
    sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\nTop 5 Most Informative Shape Descriptors:")
    for fn, imp in sorted_feats[:5]:
        print(f" - {fn:16s}: {imp * 100:.2f}%")

    # Persist
    print(f"\n[5/5] Saving CV model bundles to {MODELS_DIR}...")
    joblib.dump(clf, CV_MODEL_PATH)
    joblib.dump(preprocessor, CV_PREPROCESSOR_PATH)
    print(f" - Saved CV model: {CV_MODEL_PATH}")
    print(f" - Saved CV preprocessor: {CV_PREPROCESSOR_PATH}")

    metadata = {
        "model_name": "Mine Blueprint Contour Classifier (Random Forest)",
        "features_count": len(CV_FEATURE_NAMES),
        "feature_names": CV_FEATURE_NAMES,
        "classes": list(clf.classes_),
        "accuracy": round(acc, 4),
        "classification_report": report,
        "confusion_matrix": cm,
        "feature_importances": importances,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(CV_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f" - Saved metadata: {CV_METADATA_PATH}")

    print("\n[OK] CV MODEL TRAINING COMPLETED SUCCESSFULLY!")
    return metadata


if __name__ == "__main__":
    train_cv_pipeline()
