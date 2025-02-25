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
  base: number,
  exponent: number
) {
  const multiple = base ** exponent;
  const rounded = Math.floor(target / multiple);
  return rounded * multiple;
}

export function toScientificNotation(nr: number, precision: number) {
  const exp = nr.toExponential().split("e");
  return [
    `${clampNumber(Number(exp[0]), precision)} x 10`,
    `${Number(exp[1])}`,
  ];
}

export function bisection(
  xStart: number,
  xEnd: number,
  f: (input: number) => number,
  tolerance: number = 1e-7,
  maxIterations: number = 50
) {
  let x1 = xStart;
  let x2 = xEnd;
  let y1 = f(x1);
  let y2 = f(x2);
  let mean = (x1 + x2) / 2;

  if (y1 * y2 >= 0)
    throw new Error(`Bisection requires opposite signs.\n
  (x1: ${x1}, y1: ${y1})\n
  (x2: ${x2}, y2:${y2})\n
  }`);

  while (maxIterations > 0) {
    mean = (x1 + x2) / 2;
    y1 = f(x1);
    const y3 = f(mean);
    // const y2 = f(x2)

    if (Math.abs(y3) < tolerance) {
      return mean;
    }

    if (y1 * y3 < 0) {
      x2 = mean;
    } else {
      x1 = mean;
    }

    maxIterations--;
  }

  return mean;
}

export function newtonsMethod(
  x: number,
  f: (input: number) => number,
  df: (input: number) => number,
  tolerance: number = 1e-7,
  maxIterations: number = 10
) {
  let curX: number = x;

  while (maxIterations > 0) {
    const curY: number = f(curX);
    const curDY: number = df(curX);

    if (curY < tolerance && curY > -tolerance) {
      return curX;
    }

    curX = curX - curY / curDY;

    maxIterations--;
  }

  return curX;
}
