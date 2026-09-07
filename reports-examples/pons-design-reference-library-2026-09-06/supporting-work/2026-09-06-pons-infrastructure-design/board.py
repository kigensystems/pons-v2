from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
root=Path('outputs/token-research/runs/2026-09-06-pons-infrastructure-design')
fontdir=Path('C:/Windows/Fonts')
def font(n,bold=False):
    return ImageFont.truetype(str(fontdir/('segoeuib.ttf' if bold else 'segoeui.ttf')),n)
board=Image.new('RGB',(1680,1870),'#f2f1ed')
d=ImageDraw.Draw(board)
d.text((48,30),'PONS / INFRASTRUCTURE REFERENCES',font=font(18,True),fill='#626762')
d.text((48,66),'Five directions. One professional standard.',font=font(43,True),fill='#151b19')
d.text((48,128),'Current desktop sites · launched tokens · visual research, September 6, 2026',font=font(22),fill='#606863')
items=[('aethir','01  Aethir / ATH','Expressive identity','aethir.com'),('celestia','02  Celestia / TIA','Cinematic infrastructure','celestia.org'),('layerzero','03  LayerZero / ZRO','Institutional restraint','layerzero.network'),('wormhole','04  Wormhole / W','Connective diagrams','wormhole.com'),('ionet','05  io.net / IO','Concrete product presentation','io.net')]
for i,(slug,title,reason,url) in enumerate(items):
    x=48+(i%2)*812; y=196+(i//2)*535
    d.rectangle((x,y,x+772,y+497),fill='white')
    im=Image.open(root/'screenshots'/f'{slug}.png').convert('RGB')
    im=ImageOps.contain(im,(772,434))
    board.paste(im,(x,y))
    d.text((x+16,y+445),title,font=font(23,True),fill='#1b2420')
    d.text((x+16,y+474),reason+'  /  '+url,font=font(17),fill='#626c64')
x=860;y=1266
d.rectangle((x,y,x+772,y+497),fill='#13241c')
d.text((x+32,y+35),'THE PONS DIRECTION',font=font(20,True),fill='#b6d9c0')
for j,line in enumerate(['A distinctive visual identity.','A clear service.','A product you can understand.']):
    d.text((x+32,y+98+j*57),line,font=font(32,True),fill='#f7f7ed')
for j,line in enumerate(['Use these as principles, not layouts to copy.','One bespoke visual system, precise typography,','and a concrete PONS product preview.','Concept integration and token role remain open.']):
    d.text((x+32,y+300+j*32),line,font=font(23),fill='#c8d7ce')
d.text((48,1820),'Primary-source launch evidence and capture limitations are recorded in design-findings.md.',font=font(20),fill='#626762')
board.save(root/'comparison-board.jpg',quality=94)
print(root/'comparison-board.jpg')
