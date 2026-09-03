from cv_engine import analyze_mine_blueprint_cv
import json

with open('../public/assets/sample_mine_blueprint.jpg', 'rb') as f:
    data = f.read()

res = analyze_mine_blueprint_cv(data, 'sample_mine_blueprint.jpg', 'Raniganj Seam 4')
print('Success:', res.get('success'))
print('Counts:', res.get('counts'))
print('Junctions count:', len(res.get('junctions', [])))
print('Roadways count:', len(res.get('roadways', [])))
print('Confidence:', res.get('confidence'))
if res.get('junctions'):
    print('First junction:', res['junctions'][0])
if res.get('miners'):
    print('First miner:', res['miners'][0])
