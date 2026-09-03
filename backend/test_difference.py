from cv_engine import analyze_mine_blueprint_cv

with open('../public/assets/sample_mine_blueprint.jpg', 'rb') as f:
    data_a = f.read()

with open('../public/assets/mine_blueprint_b.png', 'rb') as f:
    data_b = f.read()

with open('../public/assets/mine_blueprint_c.pdf', 'rb') as f:
    data_c = f.read()

map_a = analyze_mine_blueprint_cv(data_a, 'sample_mine_blueprint.jpg', 'Raniganj Seam 4')
map_b = analyze_mine_blueprint_cv(data_b, 'mine_blueprint_b.png', 'Central Colliery Seam 7')
map_c = analyze_mine_blueprint_cv(data_c, 'mine_blueprint_c.pdf', 'Central Colliery PDF')

print("=== BLUEPRINT A ===")
print("Success:", map_a["success"])
print("Counts:", map_a["counts"])
print("First 2 Junctions:", [(j["id"], j["x"], j["y"]) for j in map_a["junctions"][:2]])

print("\n=== BLUEPRINT B ===")
print("Success:", map_b["success"])
print("Counts:", map_b["counts"])
print("First 2 Junctions:", [(j["id"], j["x"], j["y"]) for j in map_b["junctions"][:2]])

print("\n=== BLUEPRINT C (PDF) ===")
print("Success:", map_c["success"])
print("Counts:", map_c["counts"])

# Structural difference assertion
diff_nodes = (map_a["counts"]["junctions"] != map_b["counts"]["junctions"]) or (map_a["junctions"][0] != map_b["junctions"][0])
print("\nIs Map A structurally different from Map B?", diff_nodes)
assert diff_nodes, "Map A and Map B should be structurally distinct!"
print("TEST PASSED: Distinct blueprints produce distinct 2D maps!")
