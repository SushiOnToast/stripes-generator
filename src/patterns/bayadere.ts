import type { Orientation } from "./stripes";

// Small seeded random number generator: same seed -> same sequence
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawBayadere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colours: string[],
  baseWidth: number,
  orientation: Orientation,
  seed: number
) {
  const rand = mulberry32(seed);
  const length = orientation === "vertical" ? width : height;

  let pos = 0;
  let prev = -1;

  while (pos < length) {
    // Pick a colour index that differs from the previous band
    let idx: number;
    if (prev === -1) {
      idx = Math.floor(rand() * colours.length);
    } else {
      idx = Math.floor(rand() * (colours.length - 1));
      if (idx >= prev) idx++;
    }

    // Skewed random width: many thin bands, some thick ones
    const size = Math.max(2, Math.round(baseWidth * (0.15 + 1.85 * rand() ** 2)));

    ctx.fillStyle = colours[idx];
    if (orientation === "vertical") {
      ctx.fillRect(pos, 0, size, height);
    } else {
      ctx.fillRect(0, pos, width, size);
    }

    pos += size;
    prev = idx;
  }
}