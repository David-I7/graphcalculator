import {
  AssignmentNode,
  FunctionNode,
  MathNode,
  parse,
  SymbolNode,
} from "mathjs";
import {
  GlobalMathConstants,
  GlobalMathFunctions,
  restrictedVariables,
} from "../../data/math";
import { InternalScope, Scope } from "../../../../state/graph/types";

export function getAllSymbols(node: MathNode): Set<string> {
  const symbols: ReturnType<typeof getAllSymbols> = new Set();

  node.traverse((node, path, parent) => {
    if (node instanceof SymbolNode) {
      if (
        GlobalMathFunctions.has(node.name) ||
        GlobalMathConstants.has(node.name) ||
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
  globalScope: Scope,
  context?: InternalScope
): {
  scope: InternalScope;
  scopeDeps: string[];
} {
  const scopeDeps: string[] = [];
  const fns: [string, string][] = [];
  const symbols = getAllSymbols(node);

  let scope: InternalScope = context ? context : {};
  symbols.forEach((symbol) => {
    if (context && symbol in context) return;

    const val = globalScope[symbol];
    if (val.type === "variable") {
      scope[symbol] = val.value;
    } else {
      fns.push([symbol, val.node]);
    }
    scopeDeps.push(symbol);
  });

  fns.forEach((fn) => {
    const node = parse(fn[1]);
    const { scope: subScope } = createDependencies(node, globalScope, scope);
    scope = subScope;
    node.compile().evaluate(scope);
  });

  return { scope, scopeDeps };
}
