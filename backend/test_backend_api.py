from fastapi.testclient import TestClient
from main import app, DATA_DIR, UPLOADS_DIR
import os

client = TestClient(app)

def test_api():
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health:", res.json()["status"])

    # 2. List mine maps
    res = client.get("/api/mine-maps")
    assert res.status_code == 200, f"List maps failed: {res.text}"
    data = res.json()
    print("Listed Maps Count:", data["count"])
    for m in data["maps"]:
        print(f" - [{m['mapId']}] {m['mineName']} ({m['fileType']}) - Status: {m['mapStatus']}")

    # 3. Active map
    res = client.get("/api/mine-maps/active")
    assert res.status_code == 200
    active_data = res.json()
    print("Active map:", active_data.get("mineName"), "Active?", active_data.get("active"))

    # 4. Upload a test blueprint (Blueprint B)
    with open("../public/assets/mine_blueprint_b.png", "rb") as f:
        file_bytes = f.read()
    
    res = client.post(
        "/api/mine-maps/upload",
        files={"file": ("mine_blueprint_b.png", file_bytes, "image/png")},
        data={"mine_name": "Test Uploaded Colliery", "seam": "Seam 9"}
    )
    assert res.status_code == 200, f"Upload failed: {res.text}"
    upload_data = res.json()
    new_map_id = upload_data["mapId"]
    print(f"Uploaded new map: {new_map_id}")

    # 5. Analyze the uploaded map
    res = client.post(f"/api/mine-maps/{new_map_id}/analyze")
    assert res.status_code == 200, f"Analyze failed: {res.text}"
    analyze_data = res.json()
    assert analyze_data["success"] is True
    print(f"Analyzed {new_map_id}: Roadways={analyze_data['map']['counts']['roadways']}, Junctions={analyze_data['map']['counts']['junctions']}")

    # 6. Activate the new map
    res = client.post(f"/api/mine-maps/{new_map_id}/activate")
    assert res.status_code == 200
    print("Activated:", res.json()["message"])

    # 7. Check active map endpoint returns new map
    res = client.get("/api/mine-maps/active")
    assert res.status_code == 200
    assert res.json()["active"] is True
    assert res.json()["mapId"] == new_map_id
    print("Active map verified as newly generated map:", res.json()["mineName"])

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
