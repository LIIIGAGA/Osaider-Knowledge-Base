const sharp = require('sharp');
const path = require('path');

const root = process.cwd();
const dir = path.join(root, 'Design', 'UI_Assets', 'SubmissionPanel', 'SplitFromV2');
const input = path.join(dir, 'WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle_LineArt.png');
const output = path.join(dir, 'WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle_LineArt_NoBlackEdge.png');

const slots = [
  { x: 594, y: 303 },
  { x: 1076, y: 303 },
  { x: 835, y: 703 },
];
const button = { x: 835, y: 452 };

(async () => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (out[i + 3] === 0) continue;

      const max = Math.max(out[i], out[i + 1], out[i + 2]);
      const slotDistance = slots
        .map((p) => Math.hypot(x - p.x, y - p.y))
        .find((d) => d >= 35 && d <= 158);
      const buttonDistance = Math.hypot(x - button.x, y - button.y);
      const inButtonRing = buttonDistance >= 35 && buttonDistance <= 116;

      // Remove opaque black/dark-gray support strokes from the circular assemblies.
      // The center glyphs stay untouched because the inner 35 px are excluded.
      if ((slotDistance !== undefined || inButtonRing) && max < 85) {
        out[i + 3] = 0;
      }
    }
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toFile(output);

  console.log(JSON.stringify({ output, width: info.width, height: info.height }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
