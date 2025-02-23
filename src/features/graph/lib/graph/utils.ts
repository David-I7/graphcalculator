export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function clampNumber(nr: number, fractionDigits: number) {
  const str = nr.toString();
  const decimalIdx = str.indexOf(".");

  if (decimalIdx !== -1 && str.length - 1 - decimalIdx > fractionDigits) {
    return Number(nr.toFixed(fractionDigits));
  }

  return nr;
}

export function roundToNeareastMultiple(
  target: number,
  nr: number,
  multiple: number
) {
  const rounded = Math.floor(target / nr ** multiple);
  return rounded * nr ** multiple;
}
