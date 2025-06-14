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

export const GlobalMathConstants = new Set(["pi", "e"]);

export const isGlobalFunctionRegex =
  /(sin|abs|ceil|cos|log10|log2|log|sqrt|pow|atan|acot|acos|asin|atan2|cot|csc|sec|floor)/;

export const restrictedVariables = new Set(["x", "y", "f"]);
