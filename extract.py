import os
from PIL import Image
from rembg import remove

img_path = '/Users/ayush/.gemini/antigravity-ide/brain/71df3958-7805-4cf2-afc3-2af44a0734d4/media__1782987798465.jpg'
img = Image.open(img_path).convert('RGB')
w, h = img.size

# Crop the top divider
divider = img.crop((0, 0, w, 180))

# Save temp
divider.save('temp_divider.png')

# Remove background
with open('temp_divider.png', 'rb') as i:
    input_data = i.read()
    output_data = remove(input_data)
    with open('src/assets/images/page-break.png', 'wb') as o:
        o.write(output_data)

os.remove('temp_divider.png')

print("Extraction complete!")
