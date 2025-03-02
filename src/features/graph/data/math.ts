export const GlobalMathFunctions: Set<string> = new Set([
  "floor",
  "abs",
  "ceil",
  "sin",
  "cos",
  "log10",
  "log2",
  "log",
  "sqrt",
  "pow",
  "atan",
  "tan",
  "acot",
  "acos",
  "asin",
  "atan2",
  "cot",
  "csc",
  "sec",
]);

export const isGlobalFunctionRegex =
  /(sin|abs|ceil|cos|log10|log2|log|sqrt|pow|atan|acot|acos|asin|atan2|cot|csc|sec)/g;
