/** Readable amateur doodles. Lines wobble, but each part is still the thing. */

type Pt = [number, number];
type Shape =
  | { k: "oval"; x: number; y: number; w: number; h: number }
  | { k: "line"; pts: Pt[] };

const PROMPTS: { text: string; shapes: Shape[] }[] = [
  {
    text: "A cat wearing sunglasses sitting on the moon",
    shapes: [
      { k: "line", pts: [[38, 28], [32, 14], [46, 26]] },
      { k: "line", pts: [[58, 26], [70, 12], [62, 28]] },
      { k: "oval", x: 50, y: 40, w: 28, h: 24 },
      { k: "oval", x: 42, y: 40, w: 8, h: 6 },
      { k: "oval", x: 58, y: 40, w: 8, h: 6 },
      { k: "line", pts: [[36, 40], [64, 40]] },
      { k: "line", pts: [[46, 48], [50, 50], [54, 48]] },
      { k: "oval", x: 50, y: 64, w: 22, h: 16 },
      { k: "line", pts: [[40, 72], [34, 84]] },
      { k: "line", pts: [[60, 72], [68, 84]] },
      { k: "oval", x: 50, y: 86, w: 42, h: 12 },
    ],
  },
  {
    text: "A robot eating spaghetti in a fancy restaurant",
    shapes: [
      { k: "oval", x: 38, y: 28, w: 22, h: 20 },
      { k: "line", pts: [[38, 16], [38, 10]] },
      { k: "oval", x: 38, y: 8, w: 4, h: 4 },
      { k: "oval", x: 32, y: 26, w: 4, h: 4 },
      { k: "oval", x: 44, y: 26, w: 4, h: 4 },
      { k: "line", pts: [[32, 34], [36, 36], [40, 34], [44, 36]] },
      { k: "line", pts: [[34, 34], [34, 38]] },
      { k: "line", pts: [[38, 34], [38, 38]] },
      { k: "line", pts: [[42, 34], [42, 38]] },
      { k: "line", pts: [[32, 38], [32, 62]] },
      { k: "line", pts: [[44, 38], [44, 62]] },
      { k: "line", pts: [[32, 62], [44, 62]] },
      { k: "line", pts: [[44, 48], [62, 58]] },
      { k: "oval", x: 68, y: 68, w: 18, h: 12 },
      { k: "line", pts: [[58, 66], [64, 62], [70, 68], [76, 64]] },
      { k: "line", pts: [[60, 72], [66, 68], [74, 74], [78, 70]] },
      { k: "line", pts: [[62, 70], [68, 74], [74, 68]] },
      { k: "line", pts: [[18, 78], [88, 78]] },
      { k: "line", pts: [[24, 78], [24, 92]] },
      { k: "line", pts: [[80, 78], [80, 92]] },
      { k: "oval", x: 74, y: 16, w: 14, h: 8 },
      { k: "line", pts: [[66, 20], [64, 32]] },
      { k: "line", pts: [[74, 22], [74, 34]] },
      { k: "line", pts: [[82, 20], [84, 32]] },
    ],
  },
  {
    text: "A pirate ship sailing through a sea of clouds",
    shapes: [
      { k: "line", pts: [[16, 58], [28, 50], [70, 50], [84, 58], [70, 66], [28, 66], [16, 58]] },
      { k: "line", pts: [[48, 50], [48, 18]] },
      { k: "line", pts: [[48, 22], [70, 28], [66, 42], [48, 36]] },
      { k: "line", pts: [[48, 24], [28, 30], [32, 42], [48, 36]] },
      { k: "line", pts: [[70, 54], [84, 46], [78, 56]] },
      { k: "oval", x: 24, y: 28, w: 16, h: 8 },
      { k: "oval", x: 72, y: 22, w: 18, h: 8 },
      { k: "line", pts: [[12, 78], [28, 72], [46, 80], [64, 72], [82, 80], [92, 74]] },
      { k: "line", pts: [[18, 88], [36, 82], [54, 90], [74, 84], [90, 90]] },
    ],
  },
  {
    text: "An astronaut riding a bicycle on Mars",
    shapes: [
      { k: "oval", x: 46, y: 22, w: 16, h: 16 },
      { k: "line", pts: [[40, 22], [52, 22]] },
      { k: "line", pts: [[46, 30], [46, 48]] },
      { k: "line", pts: [[46, 36], [34, 44]] },
      { k: "line", pts: [[46, 38], [58, 34]] },
      { k: "oval", x: 30, y: 62, w: 14, h: 14 },
      { k: "oval", x: 62, y: 62, w: 14, h: 14 },
      { k: "line", pts: [[30, 62], [46, 48], [62, 62]] },
      { k: "line", pts: [[30, 62], [46, 70], [62, 62]] },
      { k: "line", pts: [[24, 70], [20, 78]] },
      { k: "line", pts: [[68, 70], [74, 78]] },
      { k: "oval", x: 48, y: 86, w: 40, h: 14 },
    ],
  },
  {
    text: "A dragon reading a book in a cozy library",
    shapes: [
      { k: "oval", x: 34, y: 40, w: 16, h: 14 },
      { k: "line", pts: [[42, 40], [54, 36], [50, 44]] },
      { k: "oval", x: 30, y: 38, w: 3, h: 3 },
      { k: "line", pts: [[28, 34], [22, 22], [30, 30]] },
      { k: "line", pts: [[38, 32], [44, 18], [36, 28]] },
      { k: "oval", x: 46, y: 58, w: 28, h: 16 },
      { k: "line", pts: [[58, 52], [74, 40], [78, 58], [60, 62]] },
      { k: "line", pts: [[34, 66], [30, 82]] },
      { k: "line", pts: [[46, 68], [48, 84]] },
      { k: "line", pts: [[58, 64], [70, 80], [78, 74]] },
      { k: "line", pts: [[36, 86], [36, 78], [58, 78], [58, 90], [36, 90], [36, 86]] },
      { k: "line", pts: [[40, 82], [54, 82]] },
      { k: "line", pts: [[40, 86], [54, 86]] },
      { k: "line", pts: [[16, 28], [86, 28]] },
      { k: "line", pts: [[18, 28], [18, 40]] },
      { k: "line", pts: [[84, 28], [84, 40]] },
    ],
  },
  {
    text: "A penguin in a business suit giving a presentation",
    shapes: [
      { k: "oval", x: 36, y: 24, w: 16, h: 14 },
      { k: "oval", x: 32, y: 22, w: 3, h: 3 },
      { k: "oval", x: 40, y: 22, w: 3, h: 3 },
      { k: "line", pts: [[34, 28], [36, 32], [40, 28]] },
      { k: "oval", x: 36, y: 52, w: 20, h: 26 },
      { k: "line", pts: [[28, 40], [36, 62], [44, 40]] },
      { k: "line", pts: [[36, 44], [36, 62]] },
      { k: "line", pts: [[44, 48], [58, 42]] },
      { k: "line", pts: [[30, 74], [26, 88]] },
      { k: "line", pts: [[42, 74], [48, 88]] },
      { k: "line", pts: [[62, 22], [62, 70], [86, 70], [86, 22], [62, 22]] },
      { k: "line", pts: [[66, 32], [82, 32]] },
      { k: "line", pts: [[66, 42], [80, 42]] },
      { k: "line", pts: [[66, 52], [78, 52]] },
      { k: "line", pts: [[74, 70], [74, 86]] },
    ],
  },
  {
    text: "A treehouse floating in the sky with balloons",
    shapes: [
      { k: "line", pts: [[34, 36], [50, 22], [66, 36]] },
      { k: "line", pts: [[36, 36], [36, 54], [64, 54], [64, 36]] },
      { k: "line", pts: [[44, 42], [44, 50], [54, 50], [54, 42], [44, 42]] },
      { k: "line", pts: [[46, 54], [44, 72]] },
      { k: "line", pts: [[54, 54], [58, 70]] },
      { k: "line", pts: [[40, 62], [36, 74], [48, 70]] },
      { k: "line", pts: [[56, 62], [66, 72], [54, 74]] },
      { k: "oval", x: 22, y: 24, w: 12, h: 14 },
      { k: "oval", x: 74, y: 18, w: 12, h: 14 },
      { k: "oval", x: 80, y: 38, w: 10, h: 12 },
      { k: "line", pts: [[22, 32], [42, 40]] },
      { k: "line", pts: [[74, 26], [58, 34]] },
      { k: "line", pts: [[78, 44], [64, 46]] },
    ],
  },
  {
    text: "A fox playing electric guitar on stage",
    shapes: [
      { k: "line", pts: [[30, 28], [24, 14], [36, 26]] },
      { k: "line", pts: [[46, 24], [54, 10], [50, 26]] },
      { k: "oval", x: 40, y: 36, w: 18, h: 16 },
      { k: "line", pts: [[48, 36], [60, 40], [56, 46], [46, 44]] },
      { k: "oval", x: 34, y: 34, w: 3, h: 3 },
      { k: "oval", x: 42, y: 34, w: 3, h: 3 },
      { k: "line", pts: [[34, 42], [40, 46], [46, 42]] },
      { k: "oval", x: 40, y: 58, w: 14, h: 16 },
      { k: "line", pts: [[32, 52], [20, 60]] },
      { k: "oval", x: 62, y: 62, w: 14, h: 12 },
      { k: "line", pts: [[58, 56], [76, 40], [82, 36]] },
      { k: "line", pts: [[78, 32], [86, 34], [82, 40]] },
      { k: "line", pts: [[58, 60], [66, 64]] },
      { k: "line", pts: [[58, 66], [66, 68]] },
      { k: "line", pts: [[34, 72], [28, 90]] },
      { k: "line", pts: [[46, 72], [52, 90]] },
      { k: "oval", x: 74, y: 70, w: 7, h: 7 },
      { k: "line", pts: [[74, 74], [74, 86]] },
      { k: "line", pts: [[70, 86], [78, 86]] },
      { k: "oval", x: 86, y: 74, w: 6, h: 6 },
      { k: "line", pts: [[86, 78], [86, 90]] },
      { k: "line", pts: [[82, 90], [90, 90]] },
    ],
  },
  {
    text: "A mermaid shopping in a supermarket",
    shapes: [
      { k: "oval", x: 36, y: 22, w: 12, h: 12 },
      { k: "line", pts: [[30, 18], [26, 28], [34, 24]] },
      { k: "line", pts: [[42, 16], [48, 26], [40, 24]] },
      { k: "oval", x: 33, y: 21, w: 2, h: 2 },
      { k: "oval", x: 39, y: 21, w: 2, h: 2 },
      { k: "line", pts: [[34, 26], [36, 28], [38, 26]] },
      { k: "line", pts: [[36, 28], [36, 48]] },
      { k: "line", pts: [[36, 36], [26, 44]] },
      { k: "line", pts: [[36, 36], [46, 32]] },
      { k: "line", pts: [[34, 48], [28, 62], [36, 78], [48, 70], [42, 52]] },
      { k: "line", pts: [[14, 30], [24, 30]] },
      { k: "oval", x: 18, y: 38, w: 5, h: 5 },
      { k: "line", pts: [[14, 46], [24, 46]] },
      { k: "line", pts: [[58, 28], [84, 28]] },
      { k: "oval", x: 66, y: 38, w: 6, h: 6 },
      { k: "oval", x: 78, y: 38, w: 5, h: 5 },
      { k: "line", pts: [[58, 48], [84, 48]] },
      { k: "line", pts: [[62, 56], [80, 56]] },
    ],
  },
  {
    text: "A dinosaur wearing a top hat and monocle",
    shapes: [
      { k: "oval", x: 48, y: 52, w: 30, h: 18 },
      { k: "oval", x: 70, y: 42, w: 14, h: 12 },
      { k: "oval", x: 74, y: 40, w: 3, h: 3 },
      { k: "oval", x: 66, y: 42, w: 6, h: 6 },
      { k: "line", pts: [[63, 42], [60, 50]] },
      { k: "line", pts: [[62, 30], [60, 16], [74, 14], [78, 28]] },
      { k: "line", pts: [[56, 30], [82, 32]] },
      { k: "line", pts: [[28, 48], [16, 36], [22, 32]] },
      { k: "line", pts: [[36, 64], [32, 84]] },
      { k: "line", pts: [[48, 66], [50, 86]] },
      { k: "line", pts: [[60, 62], [72, 82], [80, 74]] },
    ],
  },
];

export const PROMPT_LIST = PROMPTS;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wobbly, but each oval and line stays where it was drawn. */
export function paintSketch(
  ctx: CanvasRenderingContext2D,
  promptIndex: number,
  size: number,
  seed: number,
) {
  const rng = mulberry32(seed || 1);
  const prompt = PROMPTS[promptIndex % PROMPTS.length]!;
  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#f4efe6";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const ox = (rng() - 0.5) * size * 0.02;
  const oy = (rng() - 0.5) * size * 0.02;

  function stroke(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return;
    ctx.lineWidth = size * (0.011 + rng() * 0.004);
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
    ctx.stroke();
  }

  function wobble(x: number, y: number, nx: number, ny: number, u: number, phase: number, amp: number) {
    const wave = Math.sin(u * 2.2 + phase) * amp + Math.sin(u * 5.1 + phase * 1.3) * amp * 0.35;
    return { x: x + nx * wave, y: y + ny * wave };
  }

  for (const shape of prompt.shapes) {
    const phase = rng() * Math.PI * 2;
    if (shape.k === "oval") {
      const cx = (shape.x / 100) * size + ox;
      const cy = (shape.y / 100) * size + oy;
      const rx = (shape.w / 100) * size * 0.5;
      const ry = (shape.h / 100) * size * 0.5;
      const amp = Math.min(rx, ry) * 0.16;
      const pts = [];
      const n = 32;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const px = cx + Math.cos(a) * rx;
        const py = cy + Math.sin(a) * ry;
        pts.push(wobble(px, py, Math.cos(a), Math.sin(a), i / 4, phase, amp));
      }
      stroke(pts);
      continue;
    }
    const src = shape.pts;
    const pts = [];
    for (let i = 0; i < src.length - 1; i++) {
      const a = src[i]!;
      const b = src[i + 1]!;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const amp = Math.min(size * 0.012, (len / 100) * size * 0.22);
      const steps = Math.max(4, Math.round(len / 2));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const x = ((a[0] + dx * t) / 100) * size + ox;
        const y = ((a[1] + dy * t) / 100) * size + oy;
        pts.push(wobble(x, y, nx, ny, i + t, phase, amp));
      }
    }
    const end = src[src.length - 1]!;
    pts.push({ x: (end[0] / 100) * size + ox, y: (end[1] / 100) * size + oy });
    stroke(pts);
  }
}

export function sketchDataUrl(promptIndex: number, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  paintSketch(ctx, promptIndex, 512, seed);
  return canvas.toDataURL("image/png");
}
