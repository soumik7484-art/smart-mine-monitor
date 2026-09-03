import requests
import json
import numpy as np
import cv2

BASE_URL = "http://localhost:8000"

def test_full_pipeline():
    print("==================================================")
    print("MINEGUARD AI -- E2E COMPUTER VISION PIPELINE VERIFICATION")
    print("==================================================")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Backend not reachable: {res.text}"
    print("[OK] Backend Health: OK")

    # 2. Upload Blueprint A (Raniganj Seam 4)
    with open("../public/assets/sample_mine_blueprint.jpg", "rb") as f:
        file_a = f.read()
    res_a = requests.post(
        f"{BASE_URL}/api/mine-maps/upload",
        files={"file": ("sample_mine_blueprint.jpg", file_a, "image/jpeg")},
        data={"mine_name": "Raniganj Deep Colliery A", "seam": "Seam 4"}
    )
    assert res_a.status_code == 200, f"Upload A failed: {res_a.text}"
    map_id_a = res_a.json()["mapId"]
    print(f"[OK] Uploaded Blueprint A: Map ID #{map_id_a}")

    # Analyze Blueprint A
    res_an_a = requests.post(f"{BASE_URL}/api/mine-maps/{map_id_a}/analyze")
    assert res_an_a.status_code == 200
    map_data_a = res_an_a.json()["generatedMap"]
    print(f"[OK] Analyzed Blueprint A -> Map A: Roadways={map_data_a['counts']['roadways']}, Junctions={map_data_a['counts']['junctions']}, Confidence={map_data_a['confidence']}")

    # 3. Upload Blueprint B (Central Colliery Longwall B)
    with open("../public/assets/mine_blueprint_b.png", "rb") as f:
        file_b = f.read()
    res_b = requests.post(
        f"{BASE_URL}/api/mine-maps/upload",
        files={"file": ("mine_blueprint_b.png", file_b, "image/png")},
        data={"mine_name": "Central Colliery Longwall B", "seam": "Seam 7"}
    )
    assert res_b.status_code == 200, f"Upload B failed: {res_b.text}"
    map_id_b = res_b.json()["mapId"]
    print(f"[OK] Uploaded Blueprint B: Map ID #{map_id_b}")

    # Analyze Blueprint B
    res_an_b = requests.post(f"{BASE_URL}/api/mine-maps/{map_id_b}/analyze")
    assert res_an_b.status_code == 200
    map_data_b = res_an_b.json()["generatedMap"]
    print(f"[OK] Analyzed Blueprint B -> Map B: Roadways={map_data_b['counts']['roadways']}, Junctions={map_data_b['counts']['junctions']}, Confidence={map_data_b['confidence']}")

    # 4. Upload Blueprint C (PDF File)
    with open("../public/assets/mine_blueprint_c.pdf", "rb") as f:
        file_c = f.read()
    res_c = requests.post(
        f"{BASE_URL}/api/mine-maps/upload",
        files={"file": ("mine_blueprint_c.pdf", file_c, "application/pdf")},
        data={"mine_name": "Eastern Strata Extraction PDF", "seam": "Seam 2"}
    )
    assert res_c.status_code == 200, f"Upload C (PDF) failed: {res_c.text}"
    map_id_c = res_c.json()["mapId"]
    print(f"[OK] Uploaded Blueprint C (PDF): Map ID #{map_id_c}")

    # Analyze Blueprint C (PDF)
    res_an_c = requests.post(f"{BASE_URL}/api/mine-maps/{map_id_c}/analyze")
    assert res_an_c.status_code == 200
    map_data_c = res_an_c.json()["generatedMap"]
    print(f"[OK] Analyzed Blueprint C (PDF) -> Map C: Roadways={map_data_c['counts']['roadways']}, Junctions={map_data_c['counts']['junctions']}, PDF Rendered Pages={map_data_c.get('pageCount')}")

    # 5. Assert Blueprint A != Blueprint B
    diff_a_b = (map_data_a['junctions'][0] != map_data_b['junctions'][0]) or (map_data_a['counts'] != map_data_b['counts'])
    print(f"[OK] Structural Uniqueness Check (Map A != Map B): {diff_a_b}")
    assert diff_a_b, "Map A and Map B must be distinct!"

    # 6. List all maps in Mine Map Files
    res_list = requests.get(f"{BASE_URL}/api/mine-maps")
    assert res_list.status_code == 200
    files_catalog = res_list.json()
    print(f"[OK] Mine Map Files Repository Catalog: {files_catalog['count']} total records")
    for item in files_catalog['maps'][:4]:
        print(f"   * [{item['mapId']}] {item['mineName']} ({item['fileType']}) - Status: {item['processingStatus']} | Dashboard: {item['mapStatus']}")

    # 7. Dynamic Activation Check: Activate Map B
    res_act = requests.post(f"{BASE_URL}/api/mine-maps/{map_id_b}/activate")
    assert res_act.status_code == 200
    print(f"[OK] Activated Map B (#{map_id_b}) on Dashboard")

    # Verify active map API returns Map B
    res_active = requests.get(f"{BASE_URL}/api/mine-maps/active")
    assert res_active.status_code == 200
    active_record = res_active.json()
    assert active_record['active'] is True
    assert active_record['mapId'] == map_id_b
    print(f"[OK] Dashboard Active Map confirmed: {active_record['mineName']} (#{active_record['mapId']})")

    # 8. Test Low Confidence Detection on invalid non-CAD image
    blank_img = np.zeros((400, 400, 3), dtype=np.uint8) # pure black
    _, blank_bytes = cv2.imencode('.png', blank_img)
    res_inv = requests.post(
        f"{BASE_URL}/api/mine-maps/upload",
        files={"file": ("blank_invalid.png", blank_bytes.tobytes(), "image/png")},
        data={"mine_name": "Blank Invalid Test"}
    )
    inv_id = res_inv.json()["mapId"]
    res_inv_an = requests.post(f"{BASE_URL}/api/mine-maps/{inv_id}/analyze")
    inv_result = res_inv_an.json()
    print(f"[OK] Low-Confidence Validation Check: success={inv_result.get('success')}, error='{inv_result.get('error')}'")
    assert inv_result.get("success") is False
    assert "Unable to confidently detect mine structure" in inv_result.get("error", "")

    print("\n==================================================")
    print("ALL E2E PIPELINE & DASHBOARD INTEGRATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_full_pipeline()
