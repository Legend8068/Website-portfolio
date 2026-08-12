import os
from PIL import Image
from rembg import remove
import io

img_path = '/Users/ayush/.gemini/antigravity-ide/brain/71df3958-7805-4cf2-afc3-2af44a0734d4/media__1782987798465.jpg'
if not os.path.exists(img_path):
    print("Image not found at path")
    exit(1)

img = Image.open(img_path).convert('RGB')
w, h = img.size

# Estimated crops based on previous transcript thinking:
# "top divider, code hand, gear, books, camera logic, and team"
# Let's divide the remaining height (after 180px) into roughly 5 equal segments
rem_h = h - 180
segment_h = rem_h // 5

crops = {
    'hand': (0, 180, w, 180 + segment_h),
    'gear': (0, 180 + segment_h, w, 180 + 2*segment_h),
    'books': (0, 180 + 2*segment_h, w, 180 + 3*segment_h),
    'camera': (0, 180 + 3*segment_h, w, 180 + 4*segment_h),
    'team': (0, 180 + 4*segment_h, w, h)
}

for name, coords in crops.items():
    print(f"Extracting {name} from {coords}...")
    try:
        cropped = img.crop(coords)
        cropped.save(f'temp_{name}.png')
        
        with open(f'temp_{name}.png', 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
            with open(f'src/assets/images/{name}.png', 'wb') as o:
                o.write(output_data)
                
        os.remove(f'temp_{name}.png')
    except Exception as e:
        print(f"Failed on {name}: {e}")

print("Extraction complete!")
