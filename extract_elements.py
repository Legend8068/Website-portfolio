from PIL import Image
import os

img_path = '/Users/ayush/.gemini/antigravity-ide/brain/71df3958-7805-4cf2-afc3-2af44a0734d4/media__1782987798465.jpg'
img = Image.open(img_path)
w, h = img.size

# Coordinates based on visual inspection (approximate)
# Top divider: top 20%
divider = img.crop((0, 0, w, int(h * 0.2)))
divider.save('divider_raw.png')

# We can also crop the other elements
print(f"Image size: {w}x{h}")
