import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

root = Path('outputs/token-research/runs/2026-09-06-pons-design-more')
name = sys.argv[1]
items = json.loads((root / 'segments' / name / 'index.json').read_text())
items = sorted(items, key=lambda x: x['y'])
first = Image.open(root / items[0]['path']).convert('RGB')
scale = first.height / items[0]['h']
out = Image.new('RGB', (first.width, round(items[-1]['total'] * scale)), '#555555')
end = 0
for item in items:
    im = Image.open(root / item['path']).convert('RGB')
    # Browser transport sometimes scales 1280x720 to 1265x712; normalize to CSS pixels.
    im = im.resize((first.width, round(item['h'] * scale)))
    y = round(item['y'] * scale)
    if y > end:
        print(f'Capture gap explicitly marked: {end} to {y}')
        ImageDraw.Draw(out).text((10,end+5), 'UNCAPTURED SCROLL GAP', fill='white')
    # Preserve the earlier image in overlaps, avoiding repeated sticky headers.
    crop = max(0, end - y)
    if crop >= im.height:
        continue
    out.paste(im.crop((0, crop, im.width, im.height)), (0, y + crop))
    end = max(end, y + im.height)
if end < out.height: print('Uncaptured tail:',out.height-end)
out.save(root / 'full-page-screenshots' / f'{name}-stitched.png')
out.thumbnail((900, 5000))
out.save(Path('work/2026-09-06-pons-design-more') / f'{name}-review.png')
print(name, 'stitched', len(items), 'segments')

