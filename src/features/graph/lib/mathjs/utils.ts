import { AssignmentNode, FunctionNode, MathNode, SymbolNode } from "mathjs";
import { GlobalMathFunctions } from "../../data/math";

export function getAllSymbols(node: MathNode): Set<string> {
  const symbols: ReturnType<typeof getAllSymbols> = new Set();

  node.traverse((node, path, parent) => {
    if (node instanceof SymbolNode) {
      if (GlobalMathFunctions.has(node.name)) return;
      if (symbols.has(node.name)) return;

      if (parent instanceof AssignmentNode && parent.object === node) return;

      symbols.add(node.name);
    }
  });

  return symbols;
}
