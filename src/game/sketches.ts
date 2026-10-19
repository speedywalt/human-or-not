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
  {
    text: "A dog in a raincoat holding an umbrella",
    shapes: [
      { k: "oval", x: 40, y: 36, w: 16, h: 14 },
      { k: "line", pts: [[32, 30], [26, 18], [34, 28]] },
      { k: "line", pts: [[48, 28], [54, 16], [46, 30]] },
      { k: "oval", x: 36, y: 34, w: 3, h: 3 },
      { k: "line", pts: [[36, 40], [40, 42], [44, 40]] },
      { k: "line", pts: [[32, 42], [32, 70]] },
      { k: "line", pts: [[48, 42], [48, 70]] },
      { k: "line", pts: [[32, 70], [48, 70]] },
      { k: "line", pts: [[36, 78], [32, 90]] },
      { k: "line", pts: [[44, 78], [48, 90]] },
      { k: "line", pts: [[48, 50], [66, 40]] },
      { k: "oval", x: 72, y: 28, w: 16, h: 8 },
      { k: "line", pts: [[72, 32], [72, 44]] },
    ],
  },
  {
    text: "A snail racing on a skateboard",
    shapes: [
      { k: "oval", x: 40, y: 40, w: 22, h: 16 },
      { k: "oval", x: 58, y: 44, w: 8, h: 8 },
      { k: "line", pts: [[62, 42], [70, 34]] },
      { k: "line", pts: [[62, 46], [72, 48]] },
      { k: "line", pts: [[28, 48], [22, 62], [30, 56]] },
      { k: "line", pts: [[24, 62], [72, 62]] },
      { k: "oval", x: 30, y: 70, w: 8, h: 8 },
      { k: "oval", x: 62, y: 70, w: 8, h: 8 },
    ],
  },
  {
    text: "A wizard microwaving a burrito",
    shapes: [
      { k: "oval", x: 32, y: 28, w: 12, h: 12 },
      { k: "line", pts: [[26, 22], [32, 8], [38, 22]] },
      { k: "line", pts: [[32, 34], [32, 62]] },
      { k: "line", pts: [[32, 42], [18, 50]] },
      { k: "line", pts: [[32, 44], [46, 40]] },
      { k: "line", pts: [[26, 62], [22, 80]] },
      { k: "line", pts: [[38, 62], [44, 80]] },
      { k: "line", pts: [[58, 30], [82, 30], [82, 58], [58, 58], [58, 30]] },
      { k: "line", pts: [[64, 36], [76, 36]] },
      { k: "oval", x: 70, y: 48, w: 10, h: 6 },
    ],
  },
  {
    text: "A crab playing piano",
    shapes: [
      { k: "oval", x: 36, y: 40, w: 18, h: 12 },
      { k: "oval", x: 32, y: 38, w: 3, h: 3 },
      { k: "oval", x: 40, y: 38, w: 3, h: 3 },
      { k: "line", pts: [[28, 36], [16, 24]] },
      { k: "line", pts: [[44, 36], [56, 24]] },
      { k: "line", pts: [[30, 46], [22, 58]] },
      { k: "line", pts: [[42, 46], [50, 58]] },
      { k: "line", pts: [[58, 48], [86, 48]] },
      { k: "line", pts: [[58, 48], [58, 70], [86, 70], [86, 48]] },
      { k: "line", pts: [[62, 48], [62, 62]] },
      { k: "line", pts: [[70, 48], [70, 62]] },
      { k: "line", pts: [[78, 48], [78, 62]] },
    ],
  },
  {
    text: "A snowman driving a taxi",
    shapes: [
      { k: "oval", x: 58, y: 34, w: 12, h: 12 },
      { k: "oval", x: 58, y: 50, w: 16, h: 14 },
      { k: "line", pts: [[54, 32], [50, 26]] },
      { k: "line", pts: [[22, 44], [84, 44], [88, 62], [18, 62], [22, 44]] },
      { k: "line", pts: [[40, 44], [40, 62]] },
      { k: "oval", x: 30, y: 72, w: 10, h: 10 },
      { k: "oval", x: 74, y: 72, w: 10, h: 10 },
      { k: "line", pts: [[30, 56], [40, 50]] },
    ],
  },
  {
    text: "A knight fighting a slice of pizza",
    shapes: [
      { k: "oval", x: 30, y: 28, w: 12, h: 12 },
      { k: "line", pts: [[24, 22], [30, 12], [36, 22]] },
      { k: "line", pts: [[30, 34], [30, 58]] },
      { k: "line", pts: [[30, 42], [44, 34]] },
      { k: "line", pts: [[44, 34], [52, 22]] },
      { k: "line", pts: [[24, 58], [20, 78]] },
      { k: "line", pts: [[36, 58], [40, 78]] },
      { k: "line", pts: [[62, 24], [78, 24], [84, 58], [62, 24]] },
      { k: "oval", x: 72, y: 40, w: 6, h: 6 },
      { k: "oval", x: 78, y: 48, w: 4, h: 4 },
    ],
  },
  {
    text: "An octopus painting a portrait",
    shapes: [
      { k: "oval", x: 36, y: 30, w: 16, h: 14 },
      { k: "oval", x: 32, y: 28, w: 3, h: 3 },
      { k: "oval", x: 40, y: 28, w: 3, h: 3 },
      { k: "line", pts: [[28, 38], [18, 58], [24, 70]] },
      { k: "line", pts: [[32, 40], [28, 66]] },
      { k: "line", pts: [[38, 40], [42, 68]] },
      { k: "line", pts: [[44, 38], [58, 50]] },
      { k: "line", pts: [[58, 50], [70, 36]] },
      { k: "line", pts: [[62, 22], [84, 22], [84, 52], [62, 52], [62, 22]] },
      { k: "oval", x: 73, y: 36, w: 10, h: 12 },
    ],
  },
  {
    text: "A cactus wearing a cowboy hat",
    shapes: [
      { k: "line", pts: [[46, 36], [46, 84]] },
      { k: "line", pts: [[46, 50], [32, 42], [32, 64]] },
      { k: "line", pts: [[46, 56], [62, 46], [62, 68]] },
      { k: "line", pts: [[34, 28], [46, 16], [60, 28]] },
      { k: "line", pts: [[30, 28], [66, 32]] },
      { k: "line", pts: [[40, 84], [54, 84]] },
    ],
  },
  {
    text: "A whale wearing headphones",
    shapes: [
      { k: "oval", x: 48, y: 52, w: 40, h: 18 },
      { k: "line", pts: [[28, 48], [16, 40], [22, 52]] },
      { k: "oval", x: 62, y: 48, w: 4, h: 4 },
      { k: "line", pts: [[36, 40], [36, 28], [44, 28]] },
      { k: "line", pts: [[58, 38], [58, 26], [66, 26]] },
      { k: "line", pts: [[44, 28], [66, 26]] },
      { k: "line", pts: [[40, 64], [34, 78]] },
    ],
  },
  {
    text: "A chicken flying a kite",
    shapes: [
      { k: "oval", x: 36, y: 48, w: 14, h: 12 },
      { k: "oval", x: 46, y: 42, w: 8, h: 8 },
      { k: "line", pts: [[50, 40], [56, 36]] },
      { k: "line", pts: [[30, 44], [18, 36]] },
      { k: "line", pts: [[30, 52], [16, 58]] },
      { k: "line", pts: [[32, 58], [28, 72]] },
      { k: "line", pts: [[40, 58], [44, 72]] },
      { k: "line", pts: [[42, 46], [62, 30]] },
      { k: "line", pts: [[70, 18], [82, 22], [74, 32], [70, 18]] },
    ],
  },
  {
    text: "A ghost eating cereal",
    shapes: [
      { k: "line", pts: [[34, 24], [28, 70], [52, 74], [56, 26], [34, 24]] },
      { k: "oval", x: 40, y: 36, w: 4, h: 5 },
      { k: "oval", x: 50, y: 36, w: 4, h: 5 },
      { k: "line", pts: [[42, 48], [48, 52]] },
      { k: "oval", x: 70, y: 62, w: 14, h: 8 },
      { k: "line", pts: [[56, 48], [66, 58]] },
      { k: "line", pts: [[66, 52], [74, 56]] },
    ],
  },
  {
    text: "A bear stuck in a hammock",
    shapes: [
      { k: "line", pts: [[16, 28], [16, 78]] },
      { k: "line", pts: [[84, 28], [84, 78]] },
      { k: "line", pts: [[16, 42], [40, 58], [84, 40]] },
      { k: "oval", x: 48, y: 48, w: 16, h: 14 },
      { k: "oval", x: 42, y: 42, w: 5, h: 5 },
      { k: "oval", x: 54, y: 42, w: 5, h: 5 },
      { k: "line", pts: [[44, 52], [52, 54]] },
      { k: "line", pts: [[40, 56], [32, 66]] },
      { k: "line", pts: [[56, 56], [66, 64]] },
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

export type Difficulty = "easy" | "medium" | "hard" | "expert";

const LEVELS: Record<
  Difficulty,
  {
    scaleLo: number;
    scaleHi: number;
    shift: number;
    tremor: number;
    gap: number;
    open: number;
    redraw: number;
    skip: number;
    width: number;
    undershoot: number;
    bow: number;
  }
> = {
  easy: { scaleLo: 0.72, scaleHi: 1.4, shift: 0.03, tremor: 0.007, gap: 0.1, open: 0.16, redraw: 0.12, skip: 0.1, width: 0, undershoot: 0.05, bow: 0.035 },
  medium: { scaleLo: 0.82, scaleHi: 1.24, shift: 0.02, tremor: 0.0045, gap: 0.05, open: 0.1, redraw: 0.04, skip: 0.03, width: 0, undershoot: 0.025, bow: 0.022 },
  hard: { scaleLo: 0.88, scaleHi: 1.16, shift: 0.014, tremor: 0.0035, gap: 0.03, open: 0.07, redraw: 0, skip: 0, width: 0, undershoot: 0.015, bow: 0.016 },
  expert: { scaleLo: 0.93, scaleHi: 1.1, shift: 0.01, tremor: 0.0025, gap: 0.02, open: 0.04, redraw: 0, skip: 0, width: 0, undershoot: 0.01, bow: 0.012 },
};

type XY = { x: number; y: number };

function ink(
  ctx: CanvasRenderingContext2D,
  raw: XY[],
  rng: () => number,
  tremor: number,
  gap: number,
  size: number,
  smooth = false,
) {
  if (raw.length < 2) return;
  const step = Math.max(10, size * 0.02);
  const pts: XY[] = [raw[0]!];
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]!;
    const b = raw[i]!;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.round(dist / step));
    for (let s = 1; s <= n; s++) {
      const t = s / n;
      pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  let ox = 0;
  let oy = 0;
  const shaken: XY[] = [];
  for (const p of pts) {
    ox = ox * 0.84 + (rng() - 0.5) * size * tremor;
    oy = oy * 0.84 + (rng() - 0.5) * size * tremor;
    shaken.push({ x: p.x + ox, y: p.y + oy });
  }
  const drop = Math.floor(shaken.length * gap * rng());
  const used = shaken.slice(0, Math.max(2, shaken.length - drop));
  ctx.strokeStyle = "#f4efe6";
  ctx.lineWidth = (size / 512) * 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(used[0]!.x, used[0]!.y);
  if (smooth && used.length > 3) {
    for (let i = 1; i < used.length - 2; i++) {
      const midX = (used[i]!.x + used[i + 1]!.x) / 2;
      const midY = (used[i]!.y + used[i + 1]!.y) / 2;
      ctx.quadraticCurveTo(used[i]!.x, used[i]!.y, midX, midY);
    }
    const last = used[used.length - 1]!;
    ctx.lineTo(last.x, last.y);
  } else {
    for (let i = 1; i < used.length; i++) ctx.lineTo(used[i]!.x, used[i]!.y);
  }
  ctx.stroke();
}

function lumpyLoop(cx: number, cy: number, rx: number, ry: number, rng: () => number, open: number, steady = false): XY[] {
  const samples = steady ? 32 : 14;
  const start = steady ? -Math.PI / 2 : rng() * Math.PI * 2;
  const sweep = steady ? Math.PI * 2 : Math.PI * 2 * (1 - open * (0.55 + rng()));
  let rad = steady ? 1 : 0.8 + rng() * 0.35;
  const pts: XY[] = [];
  const n = Math.max(6, Math.round(samples * (sweep / (Math.PI * 2))));
  for (let i = 0; i <= n; i++) {
    if (!steady) {
      rad += (rng() - 0.5) * 0.1;
      rad = Math.min(1.16, Math.max(0.86, rad));
    }
    const a = start + (i / n) * sweep;
    pts.push({ x: cx + Math.cos(a) * rx * rad, y: cy + Math.sin(a) * ry * rad });
  }
  if (steady) pts.push(pts[0]!);
  return pts;
}

function catmull(p0: XY, p1: XY, p2: XY, p3: XY, t: number): XY {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function soften(pts: XY[], closed: boolean): XY[] {
  if (pts.length < 3) return pts;
  const src = closed ? [pts[pts.length - 1]!, ...pts, pts[0]!, pts[1]!] : [pts[0]!, ...pts, pts[pts.length - 1]!];
  const out: XY[] = [];
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const p0 = src[i]!;
    const p1 = src[i + 1]!;
    const p2 = src[i + 2]!;
    const p3 = src[i + 3]!;
    for (let s = 0; s < 5; s++) out.push(catmull(p0, p1, p2, p3, s / 5));
  }
  out.push(closed ? pts[0]! : pts[pts.length - 1]!);
  return out;
}


/** Whole-object outlines. These are silhouettes, not a pile of circles and boxes. */
const ORGANIC: Pt[][][] = [
  [
    [[46, 48], [40, 34], [32, 16], [38, 28], [44, 24], [50, 22], [58, 12], [54, 28], [64, 36], [66, 52], [72, 70], [60, 78], [48, 80], [36, 74], [28, 62], [34, 50], [42, 46]],
    [[34, 42], [42, 40], [50, 41], [58, 39], [66, 42]],
    [[22, 82], [34, 74], [52, 78], [70, 74], [84, 84], [64, 92], [36, 90]],
  ],
  [
    [[34, 18], [30, 28], [26, 34], [24, 52], [28, 70], [40, 74], [52, 68], [54, 50], [50, 32], [44, 24], [40, 16], [36, 20]],
    [[30, 32], [34, 34], [38, 32]],
    [[42, 32], [46, 34], [50, 32]],
    [[48, 48], [58, 56], [66, 64], [74, 70], [80, 66], [72, 60], [64, 58], [70, 66], [76, 72], [68, 76], [58, 72]],
    [[18, 78], [32, 74], [48, 80], [66, 74], [86, 80], [78, 88], [40, 90], [22, 84]],
  ],
  [
    [[18, 58], [30, 48], [48, 44], [68, 46], [84, 56], [76, 66], [52, 70], [28, 66]],
    [[50, 46], [48, 22], [46, 46]],
    [[48, 26], [62, 30], [70, 40], [58, 42], [48, 36]],
    [[48, 28], [34, 32], [26, 42], [38, 42]],
    [[70, 52], [86, 42], [80, 56]],
    [[12, 78], [26, 72], [42, 80], [60, 72], [78, 82], [92, 74]],
    [[16, 88], [34, 82], [54, 90], [74, 82], [90, 88]],
  ],
  [
    [[40, 16], [34, 24], [32, 34], [36, 42], [34, 58], [28, 66], [24, 78], [34, 74], [42, 64], [48, 70], [56, 64], [64, 76], [74, 80], [70, 64], [60, 56], [62, 40], [56, 28], [50, 16]],
    [[36, 24], [48, 22], [58, 26]],
    [[22, 70], [18, 82], [28, 86], [36, 76]],
    [[62, 72], [74, 84], [82, 78], [70, 68]],
    [[16, 86], [34, 80], [52, 90], [72, 82], [88, 88], [60, 96], [30, 94]],
  ],
  [
    [[28, 40], [24, 28], [30, 18], [40, 22], [46, 34], [58, 30], [70, 38], [74, 52], [64, 62], [70, 78], [58, 86], [44, 80], [36, 86], [28, 74], [32, 60], [22, 52]],
    [[58, 48], [66, 44], [72, 52], [64, 58]],
    [[34, 86], [30, 78], [46, 74], [62, 78], [66, 88], [48, 92]],
    [[18, 30], [34, 26], [52, 30], [70, 24], [86, 32], [72, 40], [40, 38]],
  ],
  [
    [[34, 18], [28, 28], [26, 42], [30, 62], [26, 80], [36, 88], [46, 78], [48, 58], [44, 36], [40, 22]],
    [[40, 40], [52, 36], [62, 42], [58, 58], [46, 62]],
    [[58, 28], [64, 18], [78, 16], [86, 28], [84, 48], [72, 62], [64, 48], [66, 30]],
    [[64, 34], [76, 32], [80, 42], [70, 46]],
    [[62, 62], [70, 78], [78, 88]],
  ],
  [
    [[34, 36], [28, 28], [40, 20], [54, 18], [66, 28], [70, 40], [64, 52], [70, 66], [60, 74], [48, 70], [38, 74], [30, 62], [36, 50]],
    [[42, 46], [46, 42], [52, 46], [48, 52]],
    [[40, 58], [36, 74], [44, 70]],
    [[56, 56], [66, 72], [58, 68]],
    [[18, 30], [22, 18], [28, 28]],
    [[74, 22], [80, 14], [82, 26]],
    [[78, 40], [86, 34], [84, 48]],
    [[24, 24], [46, 40]],
    [[76, 28], [62, 36]],
  ],
  [
    [[30, 30], [24, 14], [34, 26], [40, 22], [48, 12], [46, 26], [58, 34], [66, 42], [60, 50], [48, 46], [40, 52], [36, 68], [28, 86], [36, 80], [42, 66], [50, 72], [58, 88], [64, 78], [54, 64], [50, 50]],
    [[58, 58], [70, 70], [82, 62], [78, 48], [64, 52]],
    [[74, 46], [86, 28], [80, 42]],
    [[70, 84], [74, 92], [82, 90], [78, 80]],
  ],
  [
    [[36, 16], [30, 24], [28, 36], [32, 48], [26, 58], [22, 74], [30, 86], [42, 80], [46, 64], [52, 78], [58, 88], [66, 76], [58, 60], [52, 48], [48, 28], [44, 18]],
    [[34, 40], [46, 34], [52, 42]],
    [[16, 34], [22, 30], [24, 42], [18, 48], [14, 40]],
    [[62, 30], [70, 26], [84, 28], [86, 40], [74, 44], [64, 40], [66, 52], [80, 56], [64, 60]],
  ],
  [
    [[24, 70], [30, 52], [40, 40], [52, 34], [66, 36], [76, 28], [82, 34], [74, 42], [78, 50], [70, 56], [60, 62], [48, 70], [36, 78], [28, 86], [40, 80], [52, 86], [62, 78], [54, 70]],
    [[58, 18], [54, 28], [66, 24], [78, 20], [74, 32], [62, 34]],
    [[66, 36], [70, 48]],
    [[22, 40], [16, 28], [24, 24], [30, 36]],
  ],
  [
    [[36, 34], [30, 22], [24, 14], [32, 24], [38, 20], [46, 12], [44, 24], [52, 30], [50, 46], [42, 62], [34, 78], [28, 90], [38, 84], [44, 68], [52, 74], [58, 90], [66, 82], [56, 66], [58, 48], [52, 36]],
    [[50, 42], [62, 36], [72, 28], [70, 40]],
    [[66, 22], [78, 18], [82, 28], [74, 34], [64, 30]],
  ],
  [
    [[22, 58], [28, 48], [40, 44], [52, 50], [58, 42], [66, 46], [62, 56], [50, 60], [36, 62]],
    [[58, 46], [66, 34], [74, 30], [70, 42]],
    [[30, 62], [24, 74], [34, 78], [46, 72], [58, 78], [68, 70], [62, 60]],
    [[22, 76], [18, 86], [28, 90], [36, 80]],
    [[56, 78], [66, 88], [74, 82], [64, 74]],
  ],
  [
    [[30, 16], [24, 10], [28, 22], [26, 36], [22, 52], [26, 70], [22, 86], [34, 80], [40, 64], [46, 78], [52, 88], [60, 74], [54, 58], [58, 40], [52, 24], [44, 16], [38, 20]],
    [[46, 36], [58, 34], [64, 42]],
    [[58, 28], [66, 22], [82, 24], [86, 40], [80, 54], [66, 56], [60, 44], [68, 36], [78, 38], [76, 48], [66, 48]],
    [[70, 46], [74, 50], [78, 46]],
  ],
  [
    [[22, 48], [28, 40], [40, 36], [48, 42], [44, 52], [34, 56], [26, 52]],
    [[18, 42], [14, 28], [22, 34]],
    [[46, 38], [56, 24], [52, 40]],
    [[30, 54], [26, 68], [36, 64]],
    [[42, 54], [50, 70], [46, 60]],
    [[56, 46], [70, 50], [86, 48], [84, 64], [70, 68], [58, 62], [60, 52]],
    [[62, 50], [66, 58], [74, 56], [78, 50], [86, 54]],
  ],
  [
    [[22, 48], [30, 40], [46, 42], [62, 38], [78, 44], [88, 56], [80, 66], [58, 62], [36, 66], [24, 58]],
    [[58, 28], [52, 36], [50, 48]],
    [[64, 30], [72, 38], [70, 48]],
    [[36, 42], [34, 30], [42, 26], [50, 32]],
    [[62, 36], [66, 24], [74, 26], [70, 36]],
    [[44, 28], [70, 24]],
    [[34, 66], [28, 80], [40, 74]],
    [[16, 78], [28, 86], [48, 80], [70, 88], [88, 78]],
  ],
  [
    [[28, 46], [22, 34], [30, 24], [44, 28], [52, 22], [64, 30], [60, 42], [48, 40], [36, 48]],
    [[60, 36], [72, 28], [80, 36], [70, 42]],
    [[24, 30], [14, 22], [20, 40]],
    [[22, 48], [16, 62], [26, 58]],
    [[34, 52], [30, 78], [40, 74]],
    [[46, 50], [52, 78], [58, 70]],
    [[62, 22], [74, 12], [84, 20], [76, 30], [64, 26]],
    [[70, 28], [78, 16]],
  ],
  [
    [[34, 18], [28, 22], [24, 36], [22, 52], [26, 66], [36, 74], [50, 76], [62, 66], [66, 48], [60, 32], [50, 22], [42, 18]],
    [[32, 34], [36, 40], [40, 34]],
    [[48, 34], [52, 40], [56, 34]],
    [[40, 50], [48, 54], [54, 48]],
    [[58, 48], [68, 58], [78, 64], [86, 60], [80, 68], [68, 66], [60, 58]],
    [[66, 52], [72, 46], [78, 54]],
  ],
  [
    [[18, 36], [22, 28], [34, 32], [48, 26], [62, 32], [74, 24], [82, 34], [76, 46], [62, 50], [48, 56], [34, 62], [28, 74], [40, 70], [52, 64], [58, 76], [48, 82], [34, 74], [24, 64], [20, 50]],
    [[34, 40], [40, 44], [46, 40]],
    [[50, 38], [56, 42], [60, 38]],
    [[44, 50], [52, 54], [58, 48]],
    [[16, 78], [28, 86], [46, 80], [64, 88], [82, 78]],
  ],
  [
    [[30, 36], [24, 22], [32, 18], [42, 26], [50, 20], [60, 28], [56, 40], [48, 36], [40, 42], [46, 56], [40, 72], [32, 84], [42, 78], [48, 62], [56, 74], [64, 86], [70, 74], [58, 58], [62, 44], [54, 34]],
    [[14, 30], [18, 78]],
    [[84, 28], [80, 78]],
    [[18, 40], [36, 52], [56, 46], [80, 38]],
  ],
];

function paintOrganic(ctx: CanvasRenderingContext2D, promptIndex: number, size: number, rng: () => number) {
  const strokes = ORGANIC[promptIndex % ORGANIC.length]!;
  const fill = 0.84 + rng() * 0.08;
  const spin = (rng() - 0.5) * 0.06;
  const gx = (rng() - 0.5) * size * 0.03;
  const gy = (rng() - 0.5) * size * 0.03;
  const phase = rng() * 6;
  for (const stroke of strokes) {
    const closed = Math.hypot(stroke[0]![0] - stroke[stroke.length - 1]![0], stroke[0]![1] - stroke[stroke.length - 1]![1]) < 8;
    const placed = stroke.map(([x, y], i) => {
      const px = ((x - 50) / 100) * size * fill + Math.sin(i * 0.85 + phase) * size * 0.008;
      const py = ((y - 50) / 100) * size * fill + Math.cos(i * 0.7 + phase) * size * 0.006;
      return {
        x: size / 2 + px * Math.cos(spin) - py * Math.sin(spin) + gx,
        y: size / 2 + px * Math.sin(spin) + py * Math.cos(spin) + gy,
      };
    });
    ink(ctx, soften(placed, closed), rng, 0.0011, 0, size, true);
  }
}

/** Some drawings are built from parts. Some are one flowing outline. */
export function paintSketch(
  ctx: CanvasRenderingContext2D,
  promptIndex: number,
  size: number,
  seed: number,
  difficulty: Difficulty = "medium",
) {
  const rng = mulberry32(seed || 1);
  const base = LEVELS[difficulty] ?? LEVELS.medium;
  const organicChance = { easy: 0.22, medium: 0.4, hard: 0.55, expert: 0.62 }[difficulty];
  const organic = rng() < organicChance;
  const prompt = PROMPTS[promptIndex % PROMPTS.length]!;
  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, size, size);
  if (organic) {
    paintOrganic(ctx, promptIndex, size, rng);
    return;
  }
  const polished = rng() < { easy: 0.12, medium: 0.28, hard: 0.5, expert: 0.72 }[difficulty];
  const level = polished
    ? { ...base, scaleLo: 0.98, scaleHi: 1.03, shift: 0.003, tremor: 0.0006, gap: 0, open: 0, redraw: 0, skip: 0, undershoot: 0, bow: 0.003 }
    : base;

  const cropped = !polished && rng() < 0.28;
  const fill = polished ? 0.88 + rng() * 0.06 : cropped ? 1.12 + rng() * 0.22 : 0.76 + rng() * 0.16;
  const spin = (rng() - 0.5) * (polished ? 0.02 : cropped ? 0.16 : 0.08);
  const gx = (rng() - 0.5) * size * (cropped ? 0.1 : 0.035);
  const gy = (rng() - 0.5) * size * (cropped ? 0.08 : 0.03);
  const lean = (rng() - 0.5) * (cropped ? 0.14 : 0.06);
  const place = (x: number, y: number): XY => {
    const side = x < size / 2 ? -1 : 1;
    const dx = (x - size / 2) * fill * (1 + lean * side);
    const dy = (y - size / 2) * fill;
    return {
      x: size / 2 + dx * Math.cos(spin) - dy * Math.sin(spin) + gx,
      y: size / 2 + dx * Math.sin(spin) + dy * Math.cos(spin) + gy,
    };
  };

  prompt.shapes.forEach((shape, index) => {
    const small =
      shape.k === "oval"
        ? shape.w < 8 && shape.h < 8
        : shape.pts.length <= 2 &&
          Math.hypot(shape.pts[0]![0] - shape.pts[1]![0], shape.pts[0]![1] - shape.pts[1]![1]) < 10;
    if (index > 3 && rng() < level.skip * (small ? 1.4 : 0.65)) return;
    const sx = level.scaleLo + rng() * (level.scaleHi - level.scaleLo);
    const sy = level.scaleLo + rng() * (level.scaleHi - level.scaleLo);
    const jx = (rng() - 0.5) * size * level.shift;
    const jy = (rng() - 0.5) * size * level.shift;
    const passes = index < 2 || rng() < level.redraw ? 2 : 1;
    for (let pass = 0; pass < passes; pass++) {
      const nudge = pass === 0 ? 0 : (rng() - 0.5) * size * 0.018;
      if (shape.k === "oval") {
        const cx = (shape.x / 100) * size + jx;
        const cy = (shape.y / 100) * size + jy;
        const rx = (shape.w / 100) * size * 0.5 * sx;
        const ry = (shape.h / 100) * size * 0.5 * sy;
        const loop = lumpyLoop(cx, cy, Math.max(3, rx), Math.max(3, ry), rng, level.open, polished).map((p) =>
          place(p.x + nudge, p.y + nudge),
        );
        ink(ctx, loop, rng, level.tremor, level.gap * 0.4, size, polished);
        continue;
      }
      const raw = shape.pts.map((pt) => ({ x: pt[0], y: pt[1] }));
      const cx = raw.reduce((sum, pt) => sum + pt.x, 0) / raw.length;
      const cy = raw.reduce((sum, pt) => sum + pt.y, 0) / raw.length;
      const src = raw.map((pt) => ({
        x: ((cx + (pt.x - cx) * sx) / 100) * size + jx,
        y: ((cy + (pt.y - cy) * sy) / 100) * size + jy,
      }));
      const path: XY[] = [];
      for (let i = 0; i < src.length - 1; i++) {
        const a = src[i]!;
        const b = src[i + 1]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const bow = (rng() - 0.5) * size * level.bow;
        if (i === 0) {
          const cut = Math.min(len * level.undershoot, len * 0.15);
          path.push(place(a.x + (dx / len) * cut + nudge, a.y + (dy / len) * cut + nudge));
        } else path.push(place(a.x + nudge, a.y + nudge));
        path.push(place(a.x + dx * 0.5 + nx * bow + nudge, a.y + dy * 0.5 + ny * bow + nudge));
        if (i === src.length - 2) {
          const cut = Math.min(len * level.undershoot, len * 0.15);
          path.push(place(b.x - (dx / len) * cut + nudge, b.y - (dy / len) * cut + nudge));
        }
      }
      ink(ctx, path, rng, level.tremor, level.gap, size, polished);
    }
  });
}

export function sketchDataUrl(promptIndex: number, seed: number, difficulty: Difficulty = "medium") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  paintSketch(ctx, promptIndex, 512, seed, difficulty);
  return canvas.toDataURL("image/png");
}
