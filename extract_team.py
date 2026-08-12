import os
from PIL import Image
from rembg import remove

img_path = '/Users/ayush/.gemini/antigravity-ide/brain/71df3958-7805-4cf2-afc3-2af44a0734d4/media__1782987798465.jpg'
img = Image.open(img_path).convert('RGB')
w, h = img.size

# Crop Team
team = img.crop((640, 420, 1024, 768))
team.save('temp_team.png')
with open('temp_team.png', 'rb') as i:
    with open('src/assets/images/team.png', 'wb') as o:
        o.write(remove(i.read()))
os.remove('temp_team.png')
print("Team extraction complete!")
