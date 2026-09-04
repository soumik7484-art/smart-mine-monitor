"""
MINEGUARD AI — Master Model Training Runner
Sequentially trains both:
1. The 14-feature hardware telemetry ML subsidence model
2. The Computer Vision contour & mine structure model
"""

import sys
from train_ml_model import train_ml_pipeline
from train_cv_model import train_cv_pipeline

def main():
    print("=================================================================")
    print("[INIT] MINEGUARD AI - INITIATING END-TO-END ML & CV MODEL TRAINING")
    print("=================================================================\n")

    # Step 1: Train Hardware ML Model
    ml_meta = train_ml_pipeline()
    print("\n" + "-" * 65 + "\n")

    # Step 2: Train Computer Vision Model
    cv_meta = train_cv_pipeline()
    print("\n" + "=" * 65)
    print("[SUCCESS] ALL MODELS SUCCESSFULLY TRAINED AND PERSISTED!")
    print(f"ML Model Accuracy: {ml_meta['accuracy'] * 100:.2f}% (Classes: {', '.join(ml_meta['classes'])})")
    print(f"CV Model Accuracy: {cv_meta['accuracy'] * 100:.2f}% (Classes: {', '.join(cv_meta['classes'])})")
    print("Artifacts saved in backend/models/")
    print("=================================================================")

if __name__ == "__main__":
    main()
