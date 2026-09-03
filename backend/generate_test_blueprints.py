"""
Generates synthetic authentic-style mine blueprints:
1. blueprint_b.png: A different mine layout with a diagonal extraction drift and distinct bord-and-pillar galleries.
2. blueprint_c.pdf: A PDF version of a mine blueprint to verify PDF rendering and analysis.
"""

import cv2
import numpy as np
import pypdfium2 as pdfium
from PIL import Image
import os

# Create Blueprint B (1200 x 800)
img_b = np.ones((800, 1200, 3), dtype=np.uint8) * 250  # off-white CAD background

# Grid lines
for x in range(0, 1200, 80):
    cv2.line(img_b, (x, 0), (x, 800), (225, 225, 225), 1)
for y in range(0, 800, 80):
    cv2.line(img_b, (y, 0), (1200, y), (225, 225, 225), 1)

# Outer boundary
cv2.rectangle(img_b, (50, 50), (1150, 750), (30, 30, 30), 4)

# Blueprint B distinct features:
# 1. Diagonal main decline shaft from top-left (100, 100) to center (600, 400)
cv2.line(img_b, (100, 100), (600, 400), (20, 20, 20), 8)

# 2. Main East-West crosscut at y=400
cv2.line(img_b, (200, 400), (1050, 400), (20, 20, 20), 8)

# 3. North ventilation incline to (1050, 100)
cv2.line(img_b, (1050, 400), (1050, 100), (20, 20, 20), 7)

# 4. Three deep vertical dips descending to y=680
for vx in [350, 600, 850]:
    cv2.line(img_b, (vx, 400), (vx, 680), (20, 20, 20), 6)

# 5. Deep crosscut connecting the dips at y=680
cv2.line(img_b, (350, 680), (850, 680), (20, 20, 20), 6)

# 6. Coal pillars (solid rectangles)
for px in [420, 480, 540, 680, 740, 800]:
    for py in [460, 560]:
        cv2.rectangle(img_b, (px, py), (px + 45, py + 65), (40, 40, 40), -1)

# 7. Chambers (large rooms)
cv2.rectangle(img_b, (150, 350), (240, 450), (30, 30, 30), 3) # Refuge
cv2.rectangle(img_b, (900, 620), (1020, 720), (30, 30, 30), 3) # Sump

# Annotations
cv2.putText(img_b, "CENTRAL COLLIERY - SEAM 7 (LONGWALL B)", (60, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (20, 20, 20), 2)
cv2.putText(img_b, "MAIN DECLINE (1:4)", (180, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (60, 60, 60), 1)
cv2.putText(img_b, "SCALE 1:500m", (60, 735), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1)

# Save Blueprint B into public/assets and backend/test_assets
os.makedirs('../public/assets', exist_ok=True)
os.makedirs('test_assets', exist_ok=True)
cv2.imwrite('../public/assets/mine_blueprint_b.png', img_b)
cv2.imwrite('test_assets/mine_blueprint_b.png', img_b)
print('Generated mine_blueprint_b.png')

# Create Blueprint C as a PDF
pil_img_b = Image.fromarray(cv2.cvtColor(img_b, cv2.COLOR_BGR2RGB))
pdf_path = '../public/assets/mine_blueprint_c.pdf'
pil_img_b.save(pdf_path, 'PDF', resolution=150.0)
pil_img_b.save('test_assets/mine_blueprint_c.pdf', 'PDF', resolution=150.0)
print('Generated mine_blueprint_c.pdf')
