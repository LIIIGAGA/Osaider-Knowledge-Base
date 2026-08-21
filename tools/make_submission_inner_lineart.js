const sharp = require('sharp');
const path = require('path');

const root = process.cwd();
const dir = path.join(root, 'Design', 'UI_Assets', 'SubmissionPanel', 'SplitFromV2');
const input = path.join(dir, 'WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle.png');
const output = path.join(dir, 'WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle_LineArt.png');

const slotCenters = [
  { x: 594, y: 303 },
  { x: 1076, y: 303 },
  { x: 835, y: 703 },
];
const buttonCenter = { x: 835, y: 452 };

function distance(x, y, p) {
  return Math.hypot(x - p.x, y - p.y);
}

(async () => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const r = out[i];
      const g = out[i + 1];
      const b = out[i + 2];
      const a = out[i + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const neutralGlyph = max >= 42 && max - min <= 34;
      const cyanLine = g >= 70 && b >= 70 && g > r * 1.15;
      const brightRedLine = r >= 105 && r > g * 1.65 && r > b * 1.45;

      const slot = slotCenters.find((p) => distance(x, y, p) <= 108);
      if (slot) {
        // Remove the opaque black item well while retaining the small neutral center glyph.
        if (!(neutralGlyph || cyanLine || brightRedLine)) out[i + 3] = 0;
        continue;
      }

      if (distance(x, y, buttonCenter) <= 77) {
        // Remove the central button fill; its surrounding rings and ticks remain outside this radius.
        out[i + 3] = 0;
        continue;
      }

      // Strip faint filled grain/haze left by the flattened concept while retaining readable linework.
      if (a < 22 && !(cyanLine || brightRedLine || neutralGlyph)) out[i + 3] = 0;
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
