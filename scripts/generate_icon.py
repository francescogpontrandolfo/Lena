#!/usr/bin/env python3
"""Generate Lena app icon - Elegant Sunset theme"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

SIZE = 1024
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')

def lerp_color(c1, c2, t):
    """Linearly interpolate between two RGB colors"""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def create_icon():
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Sunset gradient colors (top to bottom)
    color_top = (245, 230, 211)      # #F5E6D3 - soft golden cream
    color_mid1 = (229, 160, 92)      # #E5A05C - warm golden
    color_mid2 = (217, 133, 59)      # #D9853B - primary golden orange
    color_bottom = (184, 114, 46)    # #B8722E - deep sunset gold

    # Draw gradient background with rounded corners
    corner_radius = 224  # iOS-style rounded corners

    # Create rounded rectangle mask
    mask = Image.new('L', (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [(0, 0), (SIZE - 1, SIZE - 1)],
        radius=corner_radius,
        fill=255
    )

    # Draw gradient
    for y in range(SIZE):
        t = y / SIZE
        if t < 0.3:
            color = lerp_color(color_top, color_mid1, t / 0.3)
        elif t < 0.6:
            color = lerp_color(color_mid1, color_mid2, (t - 0.3) / 0.3)
        else:
            color = lerp_color(color_mid2, color_bottom, (t - 0.6) / 0.4)
        draw.line([(0, y), (SIZE - 1, y)], fill=(*color, 255))

    # Apply rounded corner mask
    img.putalpha(mask)

    # Add subtle radial glow from center-top
    glow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    center_x, center_y = SIZE // 2, SIZE // 3
    max_radius = SIZE // 2
    for r in range(max_radius, 0, -2):
        alpha = int(40 * (1 - r / max_radius) ** 2)
        glow_draw.ellipse(
            [center_x - r, center_y - r, center_x + r, center_y + r],
            fill=(255, 255, 255, alpha)
        )
    img = Image.alpha_composite(img, glow)

    # Re-apply mask after glow
    img.putalpha(mask)

    # Draw the letter "L" - elegant, centered
    draw = ImageDraw.Draw(img)

    # Try to find a nice font
    font = None
    font_paths = [
        '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
        '/System/Library/Fonts/Supplemental/Georgia.ttf',
        '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf',
        '/System/Library/Fonts/NewYork.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFCompact.ttf',
    ]
    font_size = 520

    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                print(f"Using font: {fp}")
                break
            except:
                continue

    if font is None:
        font = ImageFont.load_default()
        print("Using default font")

    letter = "L"

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), letter, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (SIZE - text_width) / 2 - bbox[0]
    y = (SIZE - text_height) / 2 - bbox[1] - 10  # slight upward adjust

    # Draw subtle shadow
    shadow_offset = 6
    draw.text(
        (x + shadow_offset, y + shadow_offset),
        letter,
        fill=(0, 0, 0, 35),
        font=font
    )

    # Draw the letter in white
    draw.text(
        (x, y),
        letter,
        fill=(255, 255, 255, 245),
        font=font
    )

    # Re-apply mask one final time
    img.putalpha(mask)

    return img


def create_splash_icon(icon_img):
    """Create splash screen icon - just the icon centered on warm background"""
    splash = Image.new('RGBA', (SIZE, SIZE), (254, 253, 251, 255))  # #FEFDFB

    # Place the icon smaller in the center
    icon_size = 400
    small_icon = icon_img.resize((icon_size, icon_size), Image.LANCZOS)
    offset = (SIZE - icon_size) // 2
    splash.paste(small_icon, (offset, offset), small_icon)

    return splash


if __name__ == '__main__':
    print("Generating Lena app icon...")
    icon = create_icon()

    # Save main icon
    icon_path = os.path.join(ASSETS_DIR, 'icon.png')
    icon.save(icon_path, 'PNG')
    print(f"Saved: {icon_path}")

    # Save adaptive icon (same as main for now)
    adaptive_path = os.path.join(ASSETS_DIR, 'adaptive-icon.png')
    icon.save(adaptive_path, 'PNG')
    print(f"Saved: {adaptive_path}")

    # Save splash icon
    splash = create_splash_icon(icon)
    splash_path = os.path.join(ASSETS_DIR, 'splash-icon.png')
    splash.save(splash_path, 'PNG')
    print(f"Saved: {splash_path}")

    # Save favicon (48x48)
    favicon = icon.resize((48, 48), Image.LANCZOS)
    favicon_path = os.path.join(ASSETS_DIR, 'favicon.png')
    favicon.save(favicon_path, 'PNG')
    print(f"Saved: {favicon_path}")

    print("\nAll icons generated successfully!")
