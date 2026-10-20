// slice-assets.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('frontend-web/public/assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const inputImage = 'mockup.png';

// Normalized bounding coordinates based on 1024x1792 reference
const slices = [
  // Scene Props
  { name: 'prop_slushie_machine.png', left: 40, top: 200, width: 280, height: 380 },
  { name: 'prop_mochi_cat.png', left: 660, top: 270, width: 310, height: 420 },
  { name: 'basket_isometric_frame.png', left: 70, top: 440, width: 880, height: 740 },

  // 3D Snack Items (Interior Baskets)
  { name: 'item_soda_cat.png', left: 300, top: 480, width: 150, height: 190 },
  { name: 'item_bento_box.png', left: 450, top: 490, width: 250, height: 210 },
  { name: 'item_bread_bun.png', left: 415, top: 460, width: 155, height: 140 },
  { name: 'item_snack_purple.png', left: 160, top: 550, width: 230, height: 160 },
  { name: 'item_snack_neon.png', left: 285, top: 585, width: 210, height: 160 },
  { name: 'item_snack_cyan.png', left: 510, top: 585, width: 210, height: 160 },

  // Glossy UI HUD Elements
  { name: 'ui_pill_lives.png', left: 20, top: 15, width: 330, height: 110 },
  { name: 'ui_pill_coins.png', left: 340, top: 15, width: 340, height: 110 },
  { name: 'ui_pill_stars.png', left: 680, top: 15, width: 320, height: 110 },
  { name: 'ui_badge_moves.png', left: 740, top: 860, width: 250, height: 230 },
  { name: 'ui_btn_booster_drink.png', left: 30, top: 890, width: 160, height: 160 },
  { name: 'ui_btn_booster_undo.png', left: 190, top: 890, width: 160, height: 160 }
];

async function extractAssets() {
  if (!fs.existsSync(inputImage)) {
    console.log(`Input image ${inputImage} not found on disk yet. Creating empty asset directory placeholder...`);
    return;
  }
  const metadata = await sharp(inputImage).metadata();
  const scaleX = metadata.width / 1024;
  const scaleY = metadata.height / 1792;

  for (const item of slices) {
    const extractRegion = {
      left: Math.round(item.left * scaleX),
      top: Math.round(item.top * scaleY),
      width: Math.round(item.width * scaleX),
      height: Math.round(item.height * scaleY),
    };

    const dest = path.join(outDir, item.name);
    await sharp(inputImage)
      .extract(extractRegion)
      .png()
      .toFile(dest);

    console.log(`Saved: ${item.name}`);
  }
}

extractAssets().catch(console.error);
