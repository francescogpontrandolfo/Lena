#!/usr/bin/env python3
"""Process Lena app icon - crop to square centered on the emblem, then upscale"""

from PIL import Image, ImageFilter
import os

SOURCE = '/Users/francesco.pontrandolfo/Downloads/Gemini_Generated_Image_1revf41revf41rev.png'
ASSETS_DIR = '/Users/francesco.pontrandolfo/Lena/assets'
TARGET_SIZE = 1024


def crop_square_center(img):
    """Crop to square from center using the shorter dimension."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def create_splash(icon, target_size=1024):
    """Create splash screen with icon centered on warm cream background"""
    splash = Image.new('RGBA', (target_size, target_size), (254, 253, 251, 255))
    icon_size = int(target_size * 0.4)
    small_icon = icon.resize((icon_size, icon_size), Image.LANCZOS)
    offset = (target_size - icon_size) // 2
    splash.paste(small_icon, (offset, offset), small_icon)
    return splash


if __name__ == '__main__':
    print(f"Loading source: {SOURCE}")
    img = Image.open(SOURCE).convert('RGBA')
    print(f"Original size: {img.size}")

    # Crop to square (centered), then upscale
    squared = crop_square_center(img)
    print(f"Cropped square: {squared.size}")

    icon = squared.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)
    print(f"Upscaled: {icon.size}")

    # Save main icon
    icon_path = os.path.join(ASSETS_DIR, 'icon.png')
    icon.save(icon_path, 'PNG', quality=100)
    print(f"Saved: {icon_path}")

    # Save adaptive icon (Android)
    adaptive_path = os.path.join(ASSETS_DIR, 'adaptive-icon.png')
    icon.save(adaptive_path, 'PNG', quality=100)
    print(f"Saved: {adaptive_path}")

    # Save splash icon
    splash = create_splash(icon)
    splash_path = os.path.join(ASSETS_DIR, 'splash-icon.png')
    splash.save(splash_path, 'PNG', quality=100)
    print(f"Saved: {splash_path}")

    # Save favicon (48x48)
    favicon = icon.resize((48, 48), Image.LANCZOS)
    favicon_path = os.path.join(ASSETS_DIR, 'favicon.png')
    favicon.save(favicon_path, 'PNG')
    print(f"Saved: {favicon_path}")

    # Verify
    for name in ['icon.png', 'adaptive-icon.png', 'splash-icon.png', 'favicon.png']:
        path = os.path.join(ASSETS_DIR, name)
        verify = Image.open(path)
        print(f"  {name}: {verify.size} ({os.path.getsize(path) // 1024}KB)")

    print("\nAll icons generated successfully!")
