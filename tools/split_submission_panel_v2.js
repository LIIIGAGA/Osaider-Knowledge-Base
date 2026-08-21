const sharp = require('sharp');
const path = require('path');

const root = process.cwd();
const input = path.join(root, 'Design', 'UI_Concepts', 'WBP_SubmissionPanel_Centered_Concept_v2.png');
const outDir = path.join(root, 'Design', 'UI_Assets', 'SubmissionPanel', 'SplitFromV2');
const outerPath = path.join(outDir, 'WBP_SubmissionPanel_v2_OuterRing.png');
const innerPath = path.join(outDir, 'WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle.png');
const previewPath = path.join(outDir, 'WBP_SubmissionPanel_v2_SplitPreview.png');

require('fs').mkdirSync(outDir, { recursive: true });

const cx = 835;
const cy = 470;
const slots = [
  { x: 594, y: 303 },
  { x: 1076, y: 303 },
  { x: 835, y: 703 },
];
const button = { x: 835, y: 452 };
const triangle = [
  [{ x: 449, y: 175 }, { x: 1223, y: 175 }],
  [{ x: 449, y: 175 }, { x: 835, y: 850 }],
  [{ x: 1223, y: 175 }, { x: 835, y: 850 }],
];

function dist2(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

function pointSegmentDistance(px, py, a, b) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = px - a.x;
  const wy = py - a.y;
  const vv = vx * vx + vy * vy;
  let t = vv === 0 ? 0 : (wx * vx + wy * vy) / vv;
  t = Math.max(0, Math.min(1, t));
  const qx = a.x + t * vx;
  const qy = a.y + t * vy;
  return Math.hypot(px - qx, py - qy);
}

function sourceOverBlack(r, g, b, threshold = 7) {
  const m = Math.max(r, g, b);
  if (m <= threshold) return [0, 0, 0, 0];
  const a = m;
  return [
    Math.min(255, Math.round((r * 255) / a)),
    Math.min(255, Math.round((g * 255) / a)),
    Math.min(255, Math.round((b * 255) / a)),
    a,
  ];
}

function put(buf, i, rgba) {
  buf[i] = rgba[0];
  buf[i + 1] = rgba[1];
  buf[i + 2] = rgba[2];
  buf[i + 3] = rgba[3];
}

function hiddenOuterRingPixel(x, y) {
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
  const tickPhase = ((angle / (Math.PI * 2)) * 120) % 1;
  const onTick = tickPhase < 0.22;

  if (Math.abs(r - 442) <= 1.3) return [154, 22, 20, 190];
  if (Math.abs(r - 430) <= 1.1) return [83, 15, 15, 180];
  if (Math.abs(r - 405) <= 7 && onTick) return [117, 25, 22, 180];
  if (Math.abs(r - 392) <= 1.0) return [80, 16, 16, 150];
  if (Math.abs(r - 350) <= 0.9) return [71, 14, 14, 125];
  return [0, 0, 0, 0];
}

(async () => {
  const srcImage = sharp(input).removeAlpha();
  const meta = await srcImage.metadata();
  const { data: src, info } = await srcImage.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const outer = Buffer.alloc(width * height * 4);
  const inner = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 3;
      const oi = (y * width + x) * 4;
      const rgb = [src[si], src[si + 1], src[si + 2]];
      const radial = Math.hypot(x - cx, y - cy);

      const inSlotAssembly = slots.some((s) => dist2(x, y, s.x, s.y) <= 164 * 164);
      const inSlotWell = slots.some((s) => dist2(x, y, s.x, s.y) <= 111 * 111);
      const inButton = dist2(x, y, button.x, button.y) <= 111 * 111;
      const onTriangle = triangle.some(([a, b]) => pointSegmentDistance(x, y, a, b) <= 7);
      const onConnector =
        pointSegmentDistance(x, y, { x: 835, y: 270 }, { x: 835, y: 605 }) <= 9 ||
        pointSegmentDistance(x, y, { x: 688, y: 388 }, { x: 788, y: 435 }) <= 9 ||
        pointSegmentDistance(x, y, { x: 982, y: 435 }, { x: 1080, y: 388 }) <= 9;
      const inConnectorNode = [
        { x: 719, y: 386 }, { x: 951, y: 386 }, { x: 835, y: 551 }, { x: 835, y: 286 },
      ].some((p) => dist2(x, y, p.x, p.y) <= 24 * 24);

      const innerFeature = inSlotAssembly || inButton || onTriangle || onConnector || inConnectorNode;
      const outerAnnulus = radial >= 345 && radial <= 458;

      if (innerFeature) {
        if (inSlotWell) {
          put(inner, oi, [rgb[0], rgb[1], rgb[2], 255]);
        } else {
          put(inner, oi, sourceOverBlack(...rgb));
        }

        if (outerAnnulus && inSlotAssembly) {
          put(outer, oi, hiddenOuterRingPixel(x, y));
        }
      } else if (outerAnnulus) {
        put(outer, oi, sourceOverBlack(...rgb));
      } else {
        // Preserve only the visible inner construction lines and restrained texture,
        // while leaving the true black screen background transparent.
        const max = Math.max(...rgb);
        if (radial < 350 && max >= 14) put(inner, oi, sourceOverBlack(...rgb, 10));
      }
    }
  }

  await sharp(outer, { raw: { width, height, channels: 4 } }).png().toFile(outerPath);
  await sharp(inner, { raw: { width, height, channels: 4 } }).png().toFile(innerPath);

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([{ input: outerPath }, { input: innerPath }])
    .png()
    .toFile(previewPath);

  console.log(JSON.stringify({ width, height, outerPath, innerPath, previewPath }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
