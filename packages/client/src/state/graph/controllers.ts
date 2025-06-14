// GRAPH

import { current } from "@reduxjs/toolkit";
import {
  AssignmentNode,
  FunctionAssignmentNode,
  MathNode,
  ObjectNode,
} from "mathjs";
import { PREDEFINED_COLORS } from "../../data/css/variables";
import { v4 as uuid } from "uuid";
import ExpressionTransformer from "../../features/graph/lib/mathjs/transformer";
import { AdjacencyList, SerializedAdjList } from "../../helpers/dts";
import {
  ClientGraphData,
  Expression,
  GraphData,
  isExpression,
  Item,
  ItemData,
  Scope,
} from "./types";
import {
  functionParser,
  pointParser,
  variableParser,
} from "../../features/graph/lib/mathjs/parse";

import { restrictedVariables } from "../../features/graph/data/math";
import {
  ExpressionSettings,
  GraphSnapshot,
  ItemType,
} from "@graphcalculator/types";

export function createNewGraph(id: number = 1): ClientGraphData {
  const createdAt = new Date().toJSON();
  return {
    id: uuid(),
    modified_at: createdAt,
    graph_snapshot: {
      scales: {
        scalesIndex: 300,
        zoom: 1,
      },
      settings: {
        offsetX: 0,
        offsetY: 0,
      },
    },
    image: {
      server: "",
      client: "",
    },
    isModified: false,
    name: "Untitled",
    items: {
      scope: {},
      dependencyGraph: {},
      nextId: id + 1,
      focusedId: id,
      data: [createNewItem("expression", id)],
    },
  };
}

export function restoreSavedGraph(graph: GraphData): ClientGraphData {
  const scope: Scope = {};
  const depGraph: SerializedAdjList = {};
  let maxId: number = 1;
  const data: GraphData["items"] = structuredClone(graph.items);

  let hasChanged = false;
  for (let i = 0; i < data.length; i++) {
    const expr = data[i];
    if (!isExpression(expr) || expr.data.parsedContent) {
      continue;
    }
    maxId = Math.max(maxId, expr.id);

    const parsedContent = parseExpression(expr.data, scope, depGraph);
    if (!parsedContent.err) {
      hasChanged = true;
    }
    if (hasChanged && i === data.length - 1) {
      hasChanged = false;
      i = -1;
    }
  }

  return {
    ...graph,
    image: {
      server: graph.image,
      client: graph.image,
    },
    isModified: false,
    items: {
      scope,
      nextId: maxId + 1,
      focusedId: -1,
      data,
      dependencyGraph: depGraph,
    },
  };
}

// ITEM

export function createNewItem<T extends ItemType>(
  type: T,
  id: number,
  content?: string
): Item {
  if (type === "expression") {
    return {
      id,
      type,
      data: {
        type: "function",
        content: content ? content : "",
        parsedContent: undefined,
        settings: createSettings("function"),
      },
    } as Item<"expression">;
  }

  return {
    id,
    type,
    data: {
      content: "",
    },
  } as Item<"note">;
}

export function createSettings<T extends keyof ExpressionSettings>(
  type: T
): ExpressionSettings[T] {
  if (type === "function") {
    return {
      color:
        PREDEFINED_COLORS[
          Math.floor(Math.random() * (PREDEFINED_COLORS.length - 0.1))
        ],
      hidden: false,
      opacity: 1,
      strokeSize: 3,
      lineType: "linear",
    } as ExpressionSettings[T];
  } else if (type === "point") {
    return {
      color:
        PREDEFINED_COLORS[
          Math.floor(Math.random() * (PREDEFINED_COLORS.length - 0.1))
        ],
      hidden: false,
      strokeSize: 4,
      opacity: 1,
      pointType: "circle",
    } as ExpressionSettings[T];
  }

  throw new Error(`${type} has no settings.`);
}

// SCOPE

export function deleteFromScope(deleted: string, scope: Scope) {
  delete scope[deleted];
}

export function isCircularReference(a: string, b: string, scope: Scope) {
  if (a === b) return true;
  if (!scope[b].deps.length) return false;

  for (let i = 0; i < scope[b].deps.length; i++) {
    if (isCircularReference(a, scope[b].deps[i], scope)) return true;
  }

  return false;
}

export function isInScope(
  target: string,
  data: ItemData["expression"],
  scope: Scope
): boolean {
  if (target in scope) {
    if (data.type === "variable" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    } else if (data.type === "function" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    }
    return true;
  }

  return false;
}

export function dependenciesInScope(depArray: string[], scope: Scope) {
  for (let i = 0; i < depArray.length; i++) {
    if (depArray[i] in scope) continue;
    return false;
  }
  return true;
}

export function addDependencies(
  variable: string,
  depArray: string[],
  graph: SerializedAdjList
) {
  if (depArray.length) {
    depArray.forEach((dep) => {
      AdjacencyList.addNode(dep, graph);
      AdjacencyList.addEdge(dep, variable, graph);
    });
  }
  AdjacencyList.addNode(variable, graph);
}

export function removeDependencies(
  variable: string,
  depArray: string[],
  graph: SerializedAdjList
) {
  depArray.forEach((dep) => {
    const edges = graph[dep];
    for (let i = 0; i < edges.length; i++) {
      if (edges[i] === variable) {
        edges.splice(i, 1);
        break;
      }
    }
  });
  if (!graph[variable].length) delete graph[variable];
}

export function updateScopeSync(
  updated: string,
  depGraph: SerializedAdjList,
  items: Item[],
  scope: Scope
) {
  const varToItem: Record<string, Expression> = {};
  const nonScopedExpr: Expression[] = [];
  items.forEach((item) => {
    if (
      isExpression(item) &&
      item.data.parsedContent &&
      "name" in item.data.parsedContent
    ) {
      varToItem[item.data.parsedContent.name] = item.data;
    } else if (isExpression(item)) {
      nonScopedExpr.push(item.data);
    }
  });

  const updatedExpr: Set<string> = new Set(updated);
  const q: string[] = [];
  for (const edge of depGraph[updated]) {
    q.push(edge);
  }
  let i = 0;
  while (i < q.length) {
    const node = q[i];
    const expr = varToItem[node];
    if (!expr) continue;

    updatedExpr.add(node);
    const edges = depGraph[node];

    for (const edge of edges) {
      if (!updatedExpr.has(edge)) q.push(edge);
    }
    i++;

    switch (expr.type) {
      case "variable": {
        const res = ExpressionTransformer.transform(expr, scope);
        if (res.err) {
          expr.parsedContent = undefined;
          delete scope[node];
          break;
        }

        const newContent = variableParser.parse(
          res.node as AssignmentNode,
          scope
        );
        expr.parsedContent = newContent;
        scope[newContent.name] = {
          value: newContent.value,
          node: newContent.node,
          deps: newContent.scopeDeps,
          type: "variable",
        };
        break;
      }
      case "function": {
        // this means that it is now safe to compute function
        // for dependents

        const res = ExpressionTransformer.transform(expr, scope);
        if (res.err) {
          expr.parsedContent = undefined;
          delete scope[node];
          break;
        }

        const newContent = functionParser.parse(
          res.node as FunctionAssignmentNode,
          scope
        );
        expr.parsedContent = newContent;
        scope[newContent.name] = {
          node: newContent.node,
          deps: newContent.scopeDeps,
          type: "function",
        };
        break;
      }
      default: {
        throw new Error(`Type is not implemented.`);
      }
    }
  }

  const isDependent = (deps: string[], updated: Set<string>): boolean => {
    for (let i = 0; i < deps.length; i++) {
      if (updated.has(deps[i])) return true;
    }
    return false;
  };

  const nonUpdated: Expression[] = [];
  nonScopedExpr.forEach((expr) => {
    if (
      expr.parsedContent?.scopeDeps &&
      !isDependent(expr.parsedContent.scopeDeps, updatedExpr)
    )
      return;

    if (expr.parsedContent?.scopeDeps) {
      switch (expr.type) {
        case "variable": {
          // should never happen
          throw new Error("All variables should be inside scope");
        }
        case "function": {
          // anon functions like y=x or f(x)
          const res = ExpressionTransformer.transform(expr, scope);
          if (res.err) {
            expr.parsedContent = undefined;
            return;
          }

          expr.parsedContent = functionParser.parse(
            res.node as FunctionAssignmentNode,
            scope
          );
          return;
        }
        case "point": {
          const res = ExpressionTransformer.transform(expr, scope);
          if (res.err) {
            expr.parsedContent = undefined;
            return;
          }

          expr.parsedContent = pointParser.parse(
            res.node as ObjectNode<{ x: MathNode; y: MathNode }>,
            scope
          );
          return;
        }
      }
    } else {
      // content that was not parsed due to error

      const res = parseExpression(expr, scope, depGraph);
      if (res.err) nonUpdated.push(expr);
    }
  });

  let hasChanged = false;
  for (let i = 0; i < nonUpdated.length; i++) {
    const res = parseExpression(nonUpdated[i], scope, depGraph);
    if (!res.err) {
      nonUpdated.splice(i, 1);
      hasChanged = true;
      i -= 1;
    }

    if (i === nonUpdated.length - 1 && hasChanged) {
      i = -1;
      hasChanged = false;
    }
  }
}

export const parseExpression = (
  expr: Expression,
  scope: Scope,
  depGraph: SerializedAdjList
) => {
  // content that was not parsed due to error
  const res = ExpressionTransformer.transform(expr, scope);

  if (res.node)
    if (res.node instanceof FunctionAssignmentNode) {
      const parsedContent = functionParser.parse(res.node, scope);
      if (!restrictedVariables.has(parsedContent.name)) {
        scope[parsedContent.name] = {
          type: "function",
          node: parsedContent.node,
          deps: parsedContent.scopeDeps,
        };

        addDependencies(parsedContent.name, parsedContent.scopeDeps, depGraph);
      }

      if (expr.type !== "function") {
        //@ts-ignore
        expr.settings = createSettings("function");
      }

      expr.type = "function";
      expr.parsedContent = parsedContent;
    } else if (res.node instanceof AssignmentNode) {
      const parsedContent = variableParser.parse(res.node, scope);
      if (!restrictedVariables.has(parsedContent.name)) {
        scope[parsedContent.name] = {
          type: "variable",
          node: parsedContent.node,
          deps: parsedContent.scopeDeps,
          value: parsedContent.value,
        };

        addDependencies(parsedContent.name, parsedContent.scopeDeps, depGraph);
      }

      if (expr.type !== "variable") {
        //@ts-ignore
        delete expr.settings;
      }

      expr.type = "variable";
      expr.parsedContent = parsedContent;
    } else if (res.node instanceof ObjectNode) {
      const parsedContent = pointParser.parse(res.node, scope);

      if (expr.type !== "point") {
        //@ts-ignore
        expr.settings = createSettings("point");
      }

      expr.type = "point";
      expr.parsedContent = parsedContent;
    }

  return res;
};

export function deleteScopeSync(
  deleted: string,
  depGraph: SerializedAdjList,
  scope: Scope
) {
  const q = [deleted];
  let i = 0;
  while (i < q.length) {
    const node = q[i];
    const edges = depGraph[node];
    delete scope[node];

    for (const edge of edges) {
      if (edge in scope) q.push(edge);
    }
    i++;
  }
}
