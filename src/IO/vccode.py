from PIL import Image, ImageDraw, ImageFont
import random
import os
def generate_random_str(randomlength=4):
    random_str =''
    base_str ='ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789'
    length =len(base_str) -1
    for i in range(randomlength):
        random_str +=base_str[random.randint(0, length)]
    return random_str
fileS=os.path.dirname(__file__)+"/"
s=generate_random_str(4)
img1 = Image.open(fileS+"vccode.png")
img=Image.new(mode="RGBA", size=img1.size, color=(255,255,255,0))
v=0
tfont = ImageFont.truetype(fileS+"HarmonyOS_Sans_Bold.ttf", 100)
for l in s:
    newI=Image.new(mode="RGBA", size=(100,100), color=(255,255,255,0))
    draw = ImageDraw.Draw(newI)
    draw.text((0, 0), l, fill=(random.randint(0,255),random.randint(0,255),random.randint(0,255)), font=tfont)
    k=random.randint(-60,60)
    newI=newI.rotate(k)
    if k<=0:
        newI=newI.rotate(360)
    img.paste(newI, (v, 0))
    v+=120+random.randint(-40,40)
draw = ImageDraw.Draw(img)
for i in range(random.randint(20,30)):
    draw.line((random.randint(0,512),random.randint(0,128),random.randint(0,512),random.randint(0,128)),fill=(random.randint(0,255),random.randint(0,255),random.randint(0,255)),width=random.randint(1,10))
img.save("/tmp/asweb/vccode-"+s+".png")
print(s)
