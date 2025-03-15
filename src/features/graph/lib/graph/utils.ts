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

export function roundValue(val: number, precision: number) {
  let rounded!: number;
  if (precision <= 0) {
    rounded = roundToNeareastMultiple(val, 10, -precision);
  } else {
    rounded = clampNumber(val, precision);
  }

  return rounded;
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

  return null;
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

  return null;
}

export function binarySearchClosest<T>(
  searchValue: number,
  arr: T[],
  cb?: (val: T) => number
): T | null {
  if (!arr.length) return null;

  let start = 0;
  let end = arr.length - 1;
  let mean = Math.floor((start + end) / 2);
  let closest: number = mean;
  let closestVal: number = Math.abs(
    searchValue - (cb ? cb(arr[mean]) : (arr[mean] as number))
  );

  while (start <= end) {
    const curVal = cb ? cb(arr[mean]) : (arr[mean] as number);
    if (curVal === searchValue) {
      return arr[mean];
    } else if (searchValue < curVal) {
      end = mean - 1;
    } else {
      start = mean + 1;
    }

    const curdif = Math.abs(searchValue - curVal);
    if (curdif < closestVal) {
      closest = mean;
      closestVal = curdif;
    }

    mean = Math.floor((start + end) / 2);
  }

  return arr[closest];
}

export function pointsIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  scaler: number
) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  return dx ** 2 + dy ** 2 < scaler ** 2 * 0.1;
}
