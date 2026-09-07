import json, re, shutil, html
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

repo=Path.cwd()
old='2026-09-06-pons-infrastructure-design'
new='2026-09-06-pons-design-more'
run=repo/'outputs/token-research/runs'/new
scratch=repo/'work'/new
dest=repo/'outputs/pons-design-reference-library-2026-09-06'
extra={
 'sui':['https://docs.sui.io/develop/sui-architecture/tokenomics-overview'],
 'sei':['https://docs.sei.io/learn/general-staking','https://docs.sei.io/evm/precompiles/governance','https://docs.sei.io/learn/sei-giga'],
 'pyth':['https://docs.pyth.network/pyth-token','https://docs.pyth.network/price-feeds/core/current-fees'],
 'ondo':['https://docs.ondo.foundation/ondo-token','https://docs.ondo.foundation/ondo-dao'],
 'ethena':['https://docs.ethena.fi/ena','https://docs.ethena.fi/ena/tokenomics'],
 'render':['https://renderfoundation.com/faq'],
 'akash':['https://akash.network/token/'],
 'bittensor':['https://www.bittensor.com/docs/concepts/emissions','https://www.bittensor.com/docs/concepts/money'],
 'eigencloud':['https://www.eigenlabs.org/blog/introducing-eigencloud/','https://blog.eigenfoundation.org/unlock-eigen/'],
 'pendle':['https://docs.pendle.finance/pendle-v2/ProtocolMechanics/Mechanisms/sPENDLE']
}
styles={
 'sui':('Cinematic blue geometry','Dark / cinematic'),
 'sei':('Institutional photography','Light / editorial'),
 'pyth':('Brand built around product data','Dark / product'),
 'ondo':('Premium editorial finance','Light / editorial'),
 'ethena':('Cohesive silver-blue materials','Dark / cinematic'),
 'render':('Creative output as the hero','Light / product'),
 'akash':('Concrete workflows and pricing','Dark / product'),
 'bittensor':('Scientific minimalism','Light / minimal'),
 'eigencloud':('Sculptural infrastructure modules','Dark / cinematic'),
 'pendle':('Two products, one visual family','Dark / product')
}
queue=json.loads((run/'queue.json').read_text())
notes=[]
for q in queue:
 d=json.loads((scratch/(q['slug']+'-notes.json')).read_text())
 d.update(q); d['sources']=extra[q['slug']]; d['style'],d['category']=styles[q['slug']]
 notes.append(d)
(run/'design-notes.json').write_text(json.dumps(notes,indent=2),encoding='utf-8')
md='# Ten more launched-token website references\n\n'
md+='Current desktop websites inspected September 6, 2026. These are ten additional references, giving fifteen across the session. This is a curated visual comparison, not an exhaustive ranking or evidence that design caused token success. Current designs are not verified launch-era designs.\n\n'
md+='**Start with EigenCloud, Ethena, Pyth, Ondo and Sui.** The other five broaden the options: Sei for institutional photography, Pendle for product separation, Render for creative outputs, Akash for workflows, and Bittensor for scientific minimalism.\n\n'
for d in notes:
 s=d['slug']
 md+=f"## {d['project']} — {d['ticker']}\n\n[Live site]({d['url']}) · [Hero](screenshots/{s}.png) · [Full-page attempt](full-page-screenshots/{s}-stitched.png)\n\n"
 for label,key in [('Observed','visual'),('Assessment','judgment'),('Borrow','principle'),('Token role','role'),('PONS application, proposed','idea'),('Counterpoint','counter')]:
  md+=f"**{label}:** {d[key]}\n\n"
 md+=f"**Launch evidence:** {d['signal']} [Source]({d['source']}).\n\n"
 md+='**Supplemental official sources:** '+', '.join(f'[Source {i+1}]({u})' for i,u in enumerate(d['sources']))+'.\n\n'
 md+='**Capture limits:** '+' '.join(d['limitations'])+'\n\n'
md+='## Scope and validation\n\nAll ten have documented existing tokens; token roles differ. ONDO, ENA and PENDLE must not be described as required payment currencies for their associated products. RENDER is distinguished from legacy RNDR; current sPENDLE replaces winding-down vePENDLE. Exact original launch dates were not established for TAO and PENDLE. ENA public launch and vesting-start dates are distinct. Sei Giga performance is not confirmed current mainnet capacity.\n\nTen heroes were inspected. Nine sites have reconstructed full-page or one-viewport captures with noted limitations. EigenCloud has a defective native full-page attempt; its hero and inspected scroll frames are usable. Structural validation passed for ten journaled candidates and two checkpoints. No product, mobile, performance, financial claims or conversion testing was performed. PONS integration and demand remain unverified as described in the first report.\n'
(run/'design-findings.md').write_text(md,encoding='utf-8')

def font(n,bold=False): return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),n)
def board(items,name,title,lines):
 canvas=Image.new('RGB',(1680,1870),'#f2f1ed'); draw=ImageDraw.Draw(canvas)
 draw.text((48,30),'PONS / DESIGN REFERENCE LIBRARY',font=font(18,True),fill='#59625e')
 draw.text((48,67),title,font=font(43,True),fill='#141c18')
 draw.text((48,128),'Current websites · launched tokens · inspected September 6, 2026',font=font(22),fill='#59625e')
 for i,d in enumerate(items):
  x=48+(i%2)*812;y=196+(i//2)*535
  draw.rectangle((x,y,x+772,y+497),fill='white')
  shot=ImageOps.contain(Image.open(run/'screenshots'/f"{d['slug']}.png").convert('RGB'),(772,434))
  canvas.paste(shot,(x,y))
  draw.text((x+16,y+445),d['project']+' / '+d['ticker'],font=font(24,True),fill='#18241e')
  draw.text((x+16,y+476),d['style'],font=font(18),fill='#59625e')
 x=860;y=1266;draw.rectangle((x,y,x+772,y+497),fill='#152b25')
 draw.text((x+32,y+36),'WHAT TO TAKE FROM THIS SET',font=font(20,True),fill='#b7d8c4')
 for j,line in enumerate(lines): draw.text((x+32,y+107+j*51),line,font=font(27,True),fill='#f3f6ef')
 draw.text((48,1820),'Visual references, not templates to copy. Source links and capture limits accompany every project.',font=font(20),fill='#59625e')
 canvas.save(run/name,quality=94)
lookup={d['slug']:d for d in notes}
board([lookup[s] for s in ['eigencloud','ethena','pyth','ondo','sui']],'comparison-board-1.jpg','Five strong new directions.', ['A coherent material and colour system.','A memorable hero composition.','Visible product evidence underneath.','','Start here for the PONS concept.'])
board([lookup[s] for s in ['sei','pendle','render','akash','bittensor']],'comparison-board-2.jpg','Five contrasting approaches.', ['Institutional photography.','Related product identities.','Creative outputs and real workflows.','Scientific minimalism.','','Use these to broaden the direction.'])

dest.mkdir(parents=True,exist_ok=True)
for rid in [old,new]:
 shutil.copytree(repo/'outputs/token-research/runs'/rid,dest/'evidence/runs'/rid,dirs_exist_ok=True)
 shutil.copytree(repo/'work'/rid,dest/'supporting-work'/rid,dirs_exist_ok=True)
journal=(repo/'outputs/token-research/research-journal.md').read_text(encoding='utf-8-sig')
blocks=re.split(r'(?=^### )',journal,flags=re.M)
(dest/'evidence/research-journal.md').write_text('# PONS session research journal\n\n'+''.join(b for b in blocks if old in b or new in b),encoding='utf-8')
shutil.copy2(repo/'outputs/token-research/TOKEN-RESEARCH-GUIDE.md',dest/'evidence/TOKEN-RESEARCH-GUIDE.md')
catalog=[]
for d in notes:
 d=dict(d);d['batch']='New 10';d['base']='evidence/runs/'+new;d['hero']=d['base']+'/screenshots/'+d['slug']+'.png'
 catalog.append(d)
original={
 'aethir':('Expressive serif identity','Dark / cinematic','Forest green, oversized serif type and luminous particle forms.','Use a distinctive typographic voice with a coherent material metaphor.'),
 'celestia':('Cinematic fibre sculpture','Dark / cinematic','Luminous fibre hardware, spacious dark compositions and white evidence sections.','Connect the visual object to the infrastructure service.'),
 'layerzero':('Institutional restraint','Light / minimal','Fine converging lines, monochrome styling, exceptional whitespace and numbered products.','Use precise hierarchy and a repeatable geometric language.'),
 'wormhole':('Isometric connection diagrams','Light / product','Lavender palette, isometric modules and a concrete Portal workflow preview.','Explain how the infrastructure connects things and show one action.'),
 'ionet':('Concrete product presentation','Light / product','Dimensional white tiles, GPU configurations, prices and deployment cards.','Show a specific product object or workflow early.')}
for line in (repo/'outputs/token-research/runs'/old/'capture-manifest.jsonl').read_text().splitlines():
 d=json.loads(line)
 if d.get('type')!='candidate':continue
 s=d['id'].split('.')[-1];style,category,visual,principle=original[s]
 catalog.append({'slug':s,'project':d['project'],'ticker':d['ticker'],'url':d['resolvedUrl'],'style':style,'category':category,'visual':visual,'principle':principle,'role':'See original report and primary-source launch evidence.','judgment':style+'.','limitations':d['limitations'],'batch':'Original 5','base':'evidence/runs/'+old,'hero':'evidence/runs/'+old+'/'+d['screenshots']['firstView'],'source':d['successSignal']})
(dest/'catalog.json').write_text(json.dumps(catalog,indent=2),encoding='utf-8')

esc=html.escape
cards=[]
for d in catalog:
 s=d['slug'];base=d['base']; full=base+'/full-page-screenshots/'+s+'-stitched.png'
 if not (dest/full).exists():
  full=next((str(p.relative_to(dest)).replace('\\','/') for p in (dest/base/'full-page-screenshots').glob(s+'*')),base+'/design-findings.md')
 details=f"<p>{esc(d['visual'])}</p><p><b>Borrow:</b> {esc(d['principle'])}</p><p><b>Token role:</b> {esc(d['role'])}</p>"
 if d['batch']=='New 10':details+=f"<p><b>Launch evidence:</b> {esc(d['signal'])} <a href='{esc(d['source'])}'>Source</a></p>"
 details+='<p class="limits"><b>Capture limits:</b> '+esc(' '.join(d['limitations']))+'</p>'
 refs=f"<a href='{esc(d['url'])}' target='_blank' rel='noopener'>Live site ↗</a><a href='{d['hero']}'>Hero image</a><a href='{full}'>Full-page attempt</a><a href='{base}/design-findings.md'>Research notes</a>"
 if s=='eigencloud':refs+=f"<a href='{base}/segments/eigencloud/9.png'>Usable detail frame</a>"
 cards.append(f"<article data-batch='{d['batch']}' data-category='{d['category']}'><a class='shot' href='{d['hero']}'><img src='{d['hero']}' alt='{esc(d['project'])} homepage screenshot'></a><div class='body'><div class='eyebrow'>{d['batch']} · {d['category']} · {d['ticker']}</div><h2>{esc(d['project'])}</h2><p class='style'>{esc(d['style'])}</p><div class='links'>{refs}</div><details><summary>Design notes, token evidence & capture limits</summary>{details}</details></div></article>")
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PONS · 15 design references</title><style>
*{box-sizing:border-box}body{margin:0;background:#eeeee8;color:#18251f;font:16px/1.55 system-ui,sans-serif}header,main,footer{max-width:1500px;margin:auto;padding:36px}header{padding-top:58px}h1{font-size:clamp(32px,4.5vw,64px);line-height:1.08;letter-spacing:-.045em;margin:12px 0 22px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#506156}header p{max-width:890px;color:#506156}.nav,.filters,.links{display:flex;gap:12px;flex-wrap:wrap}a{color:#235944;text-underline-offset:4px}.nav a{padding:8px 15px;border:1px solid #b8c6bd;border-radius:6px}.filters{margin-top:24px}button{padding:10px 16px;border:1px solid #a7b8ae;background:transparent;color:#223e30;border-radius:24px;cursor:pointer}button.active{background:#1b3f2d;color:white}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px}article{background:white;border:1px solid #d6dcd5;border-radius:12px;overflow:hidden}.shot{display:block;background:#ddd;aspect-ratio:16/9}.shot img{width:100%;height:100%;object-fit:contain}.body{padding:24px}h2{font-size:29px;line-height:1.15;margin:9px 0}.style{color:#506156;margin:8px 0 18px}.links{font-size:13px}details{margin-top:20px;border-top:1px solid #d9e0d9;padding-top:14px}summary{cursor:pointer;font-size:14px}.limits{font-size:13px;color:#6c6558}footer{font-size:14px;color:#526158}[hidden]{display:none!important}@media(max-width:750px){header,main,footer{padding:22px}.grid{grid-template-columns:1fr;gap:22px}}
</style><header><div class="eyebrow">PONS / Session reference library / 06 September 2026</div><h1>15 sites.<br>One place to explore them.</h1><p>All five original references and ten additions, with screenshots, design notes, token-launch sources and capture limitations. Start with <b>EigenCloud, Ethena, Pyth, Ondo and Sui</b> from the new set. The first set adds Aethir, Celestia, LayerZero, Wormhole and io.net.</p><div class="nav"><a href="README.md">Folder guide</a><a href="evidence/runs/2026-09-06-pons-design-more/comparison-board-1.jpg">New board 1</a><a href="evidence/runs/2026-09-06-pons-design-more/comparison-board-2.jpg">New board 2</a><a href="evidence/runs/2026-09-06-pons-infrastructure-design/comparison-board.jpg">Original board</a></div><div class="filters"><button class="active" data-filter="all">All 15</button><button data-filter="New 10">New 10</button><button data-filter="Original 5">Original 5</button><button data-filter="Dark">Dark directions</button><button data-filter="Light">Light directions</button></div></header><main><div class="grid">'''+''.join(cards)+'''</div></main><footer>Curated design judgments, not investment recommendations or proof of commercial success. These are current websites, not verified launch-era designs. Screenshots are static desktop observations; some full-page attempts have substantial limitations. PONS integration and product demand remain unverified. This local reference library does not transmit data or connect wallets.</footer><script>document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('article').forEach(a=>{let f=b.dataset.filter;a.hidden=f!=='all'&&a.dataset.batch!==f&&!a.dataset.category.startsWith(f)})}));</script></html>'''
(dest/'index.html').write_text(page,encoding='utf-8')
readme='''# PONS design reference library — entire session

Open **[index.html](index.html)** for all 15 references in one visual gallery. Everything linked locally is contained in this folder; official sources still open online.

- **Original five:** Aethir, Celestia, LayerZero, Wormhole and io.net.
- **Ten additions:** Sui, Sei, Pyth Network, Ondo Finance, Ethena, Render Network, Akash Network, Bittensor, EigenCloud and Pendle.
- **[Original report and proposed PONS direction](evidence/runs/2026-09-06-pons-infrastructure-design/design-findings.md)**
- **[Ten-addition report with launch and token-role sources](evidence/runs/2026-09-06-pons-design-more/design-findings.md)**
- **[Original visual board](evidence/runs/2026-09-06-pons-infrastructure-design/comparison-board.jpg)**
- **[New visual board 1](evidence/runs/2026-09-06-pons-design-more/comparison-board-1.jpg)** and **[new visual board 2](evidence/runs/2026-09-06-pons-design-more/comparison-board-2.jpg)**
- **[Session journal](evidence/research-journal.md)** contains the 15 project entries and three checkpoints.
- `evidence/runs/` contains both complete research runs: manifests, sources, hero screenshots, full-page attempts and raw scroll segments.
- `catalog.json` contains the gallery's structured reference data.
- `supporting-work/` contains session notes, presentation/capture helpers, review images and diagnostic attempts. These preserve context; failed images are not recommended references.

This is a self-contained compilation snapshot. Original research folders remain intact in the repository. It is not a deployed website and does not update automatically.

All 15 heroes were visually inspected. Full-page attempts vary in quality: io.net and EigenCloud have defective native full-page images; use their heroes and usable detail frames. Other captures may include moving elements, fixed overlays, lazy-load seams or marked gaps. Structural record validation and visual inspection are separate; neither validates project financial or technical claims. Current designs are not established as launch-era designs. PONS affiliation, technical integration and product demand were not established.
'''
(dest/'README.md').write_text(readme,encoding='utf-8')
print(dest)
print('Compiled',len(catalog),'projects;',len(list(dest.rglob('*'))),'paths')
