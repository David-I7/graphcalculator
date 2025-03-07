import {
  AssignmentNode,
  FunctionNode,
  MathNode,
  parse,
  SymbolNode,
} from "mathjs";
import { GlobalMathFunctions, restrictedVariables } from "../../data/math";
import { InternalScope, Scope } from "../../../../state/graph/types";

export function getAllSymbols(node: MathNode): Set<string> {
  const symbols: ReturnType<typeof getAllSymbols> = new Set();

  node.traverse((node, path, parent) => {
    if (node instanceof SymbolNode) {
      if (
        GlobalMathFunctions.has(node.name) ||
        restrictedVariables.has(node.name)
      )
        return;
      if (symbols.has(node.name)) return;

      if (parent instanceof AssignmentNode && parent.object === node) return;

      symbols.add(node.name);
    }
  });

  return symbols;
}

export function createDependencies(
  node: MathNode,
  globalScope: Scope
): {
  scope: InternalScope;
  scopeDeps: string[];
} {
  const scopeDeps: string[] = [];
  const fns: [string, string][] = [];
  const symbols = getAllSymbols(node);

  const scope: InternalScope = {};
  symbols.forEach((symbol) => {
    const val = globalScope[symbol];
    if (typeof val === "number") {
      scope[symbol] = val;
    } else {
      // can't process now as fns may depend on other vars themselves
      // ex a= b(c)
      fns.push([symbol, val]);
    }
    scopeDeps.push(symbol);
  });

  fns.forEach((fn) => {
    parse(fn[1]).compile().evaluate(scope);
  });

  return { scope, scopeDeps };
}
