export type Orientation = "vertical" | "horizontal";

export function drawStripes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colours: string[],
  stripeWidth: number,
  orientation: Orientation
) {
  const length = orientation === "vertical" ? width : height;
  for (let pos = 0, i = 0; pos < length; pos += stripeWidth, i++) {
    ctx.fillStyle = colours[i % colours.length];
    if (orientation === "vertical") {
      ctx.fillRect(pos, 0, stripeWidth, height);
    } else {
      ctx.fillRect(0, pos, width, stripeWidth);
    }
  }
}