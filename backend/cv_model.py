"""
MINEGUARD AI — Computer Vision Model Predictor Interface
Provides high-level inference methods for classifying contours and blueprint elements
using the trained CV model.
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, List

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
CV_MODEL_PATH = os.path.join(MODELS_DIR, "cv_feature_classifier.joblib")
CV_PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "cv_preprocessor.joblib")


class MineBlueprintCVModel:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        self._load()

    def _load(self):
        if os.path.exists(CV_MODEL_PATH) and os.path.exists(CV_PREPROCESSOR_PATH):
            try:
                self.model = joblib.load(CV_MODEL_PATH)
                self.preprocessor = joblib.load(CV_PREPROCESSOR_PATH)
                self.is_loaded = True
            except Exception as e:
                print(f"[CV Model] Note loading CV model: {e}")
                self.is_loaded = False

    def predict_features(self, feature_vector: List[float]) -> Dict[str, Any]:
        """Runs inference on a 17-element morphological feature vector."""
        if not self.is_loaded:
            return {"class": "UNKNOWN", "confidence": 0.0, "is_loaded": False}
        
        feat_arr = np.array([feature_vector], dtype=np.float64)
        scaled = self.preprocessor.transform(feat_arr)
        pred_class = self.model.predict(scaled)[0]
        
        probabilities = {}
        confidence = 1.0
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(scaled)[0]
            classes = getattr(self.model, "classes_", [])
            probabilities = {str(c): round(float(p), 4) for c, p in zip(classes, probs)}
            confidence = float(max(probs))

        return {
            "class": str(pred_class),
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "is_loaded": True
        }
