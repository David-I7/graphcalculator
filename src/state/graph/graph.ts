import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { swap } from "../../helpers/dts";
import {
  ClientGraphData,
  Expression,
  ExpressionType,
  GraphData,
  Item,
  ItemData,
  ItemType,
  Scope,
} from "./types";
import {
  createNewGraph,
  createNewItem,
  deleteFromScope,
  restoreSavedGraph,
  saveCurrentGraph,
} from "./controllers";
import { MinHeap } from "../../helpers/performance";
import {
  pointParser,
  variableParser,
} from "../../features/graph/lib/mathjs/parse";
import { AssignmentNode, MathNode, ObjectNode, parse } from "mathjs";
import { restrictedVariables } from "../../features/graph/data/math";

interface GraphState {
  currentGraph: ClientGraphData;
  savedGraphs: GraphData[];
  exampleGraphs: GraphData[];
}

const initialState: GraphState = {
  currentGraph: createNewGraph(),
  savedGraphs: [],
  exampleGraphs: [],
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: (create) => ({
    // GRAPH CASES
    restoreGraph: create.reducer(
      (state, action: PayloadAction<{ id: string; idx: number }>) => {
        const graph = state.savedGraphs[action.payload.idx];
        if (graph.id !== action.payload.id) return;

        state.currentGraph = restoreSavedGraph(graph);
      }
    ),
    saveGraph: create.reducer((state, action: PayloadAction<string>) => {
      let graphIdx: number | null = null;

      for (let i = 0; i < state.savedGraphs.length; i++) {
        if (state.savedGraphs[i].id === action.payload) {
        }
      }

      const savedGraph = saveCurrentGraph(state.currentGraph);

      if (graphIdx === null) {
        state.savedGraphs.push(savedGraph);
      } else {
        state.savedGraphs[graphIdx] = savedGraph;
      }
    }),

    // ITEM CASES
    createItem: create.reducer(
      (
        state,
        action: PayloadAction<{
          type: ItemType;
          loc: "start" | "end";
        }>
      ) => {
        if (action.payload.loc === "end") {
          state.currentGraph.items.data.push(
            createNewItem(action.payload.type, state.currentGraph.items.nextId)
          );
        } else {
          state.currentGraph.items.data.unshift(
            createNewItem(action.payload.type, state.currentGraph.items.nextId)
          );
        }
        state.currentGraph.items.focusedId = state.currentGraph.items.nextId;
        state.currentGraph.items.nextId += 1;
      }
    ),
    deleteItem: create.reducer(
      (state, action: PayloadAction<{ id: number; idx: number }>) => {
        const items = state.currentGraph.items;

        if (items.data[action.payload.idx].id !== action.payload.id) return;

        if (items.data[action.payload.idx].type === "expression") {
          const scope = items.scope;
          deleteFromScope(
            items.data[action.payload.idx].data as ItemData["expression"],
            scope
          );
        }

        items.data.splice(action.payload.idx, 1);
      }
    ),
    updateItemPos: create.reducer(
      (
        state,
        action: PayloadAction<{ id: number; startPos: number; endPos: number }>
      ) => {
        if (action.payload.startPos < action.payload.endPos) {
          let i = action.payload.startPos;
          while (i < action.payload.endPos) {
            swap(i, i + 1, state.currentGraph.items.data);
            ++i;
          }
        } else if (action.payload.startPos > action.payload.endPos) {
          let i = action.payload.startPos;
          while (i > action.payload.endPos) {
            swap(i, i - 1, state.currentGraph.items.data);
            --i;
          }
        }
      }
    ),
    updateItemContent: create.reducer(
      (
        state,
        action: PayloadAction<{ content: string; id: number; idx: number }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];
        if (item.id !== action.payload.id) return;
        if (item.data.content === action.payload.content) return;
        item.data.content = action.payload.content;
      }
    ),
    setFocusedItem: create.reducer((state, action: PayloadAction<number>) => {
      if (state.currentGraph.items.focusedId === action.payload) return;
      state.currentGraph.items.focusedId = action.payload;
    }),
    resetFocusedItem: create.reducer((state, action: PayloadAction<number>) => {
      if (state.currentGraph.items.focusedId === action.payload) {
        state.currentGraph.items.focusedId = -1;
      }
    }),

    // SCOPE CASES
    // setToScope:create.reducer(
    //   (
    //     state,
    //     action: PayloadAction<{key:string,value}>
    //   ) => {
    //     const item = state.currentGraph.items.data[action.payload.idx];

    //     if (item.id !== action.payload.id) return;
    //     if (item.type !== "expression") return

    //     const expr = item.data as ItemData["expression"]

    //     if (expr.type === "function" || expr.type === "point") {
    //       expr.settings.hidden = !expr.settings.hidden;
    //     }
    //   }
    // ),

    // EXPRESSION CASES
    toggleExpressionVisibility: create.reducer(
      (
        state,
        action: PayloadAction<{ hidden: boolean; id: number; idx: number }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          expr.settings.hidden = !expr.settings.hidden;
        }
      }
    ),
    removeParsedContent: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          type: ExpressionType;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];
        const scope = state.currentGraph.items.scope;

        // previous value
        if (expr.type !== "point" && expr.parsedContent) {
          if (!restrictedVariables.has(expr.parsedContent.name)) {
            deleteFromScope(expr, scope);
            deleteScopeSync(
              state.currentGraph.items.data,
              scope,
              expr.parsedContent.name,
              expr
            );
          }
        }

        expr.type = action.payload.type;
        expr.parsedContent = undefined;
      }
    ),
    updateFunctionExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"function">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as Expression<"function">;
        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

        const scope = state.currentGraph.items.scope;

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] =
            action.payload.parsedContent.node;
          updateScopeSync(
            state.currentGraph.items.data,
            scope,
            action.payload.parsedContent.name,
            expr
          );
        }

        expr.type = "function";
        expr.parsedContent = action.payload.parsedContent;
      }
    ),
    updatePointExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"point">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];
        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

        expr.type = "point";
        expr.parsedContent = action.payload.parsedContent;
      }
    ),
    updateVariableExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"variable">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];
        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

        const scope = state.currentGraph.items.scope;

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] =
            action.payload.parsedContent.value;
          updateScopeSync(
            state.currentGraph.items.data,
            scope,
            action.payload.parsedContent.name,
            expr
          );
        }
        expr.parsedContent = action.payload.parsedContent;
        expr.type = "variable";
      }
    ),
  }),
});

export default graphSlice.reducer;
export const {
  // graph
  restoreGraph,
  saveGraph,

  // item
  createItem,
  deleteItem,
  updateItemContent,
  updateItemPos,
  resetFocusedItem,
  setFocusedItem,

  //expression
  toggleExpressionVisibility,
  removeParsedContent,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};

const updateScopeSync = (
  items: Item[],
  scope: Scope,
  changedEntry: string,
  changedExpr: Expression
) => {
  // debugger;
  const scopeChanges = new Set(changedEntry);

  const canCompute = (expr: Expression, scopeChanges: Set<string>): boolean => {
    for (let i = 0; i < expr.parsedContent!.scopeDeps.length; i++) {
      if (scopeChanges.has(expr.parsedContent!.scopeDeps[i])) continue;
      return false;
    }
    return true;
  };

  const priorityCb = (p: Expression, c: Expression) => {
    // if parent is > child => true
    if (canCompute(p, scopeChanges)) return false;
    else if (canCompute(c, scopeChanges)) return true;
    else {
      return (
        p.parsedContent!.scopeDeps.length > c.parsedContent!.scopeDeps.length
      );
    }
  };

  let minHeap = new MinHeap<NonNullable<Expression>>(priorityCb);

  // build heap
  items.forEach((item) => {
    if (item.type === "expression") {
      const expression = item.data as Expression;
      if (
        expression.parsedContent &&
        expression !== changedExpr &&
        expression.parsedContent.scopeDeps.length
      ) {
        minHeap.insert(expression);
      }
    }
  });

  // no items depend on the changed variable
  if (!minHeap.length) return;

  let uncomputedHeap = new MinHeap<NonNullable<Expression>>(priorityCb);
  let scopeHasChanged = false;
  while (minHeap.length) {
    const expr = minHeap.pop();

    if (!canCompute(expr, scopeChanges)) {
      uncomputedHeap.insert(expr);
      continue;
    }

    scopeHasChanged = true;

    switch (expr.type) {
      case "variable": {
        const node = parse(expr.parsedContent!.node) as AssignmentNode;
        const newContent = variableParser.parse(node, scope);
        expr.parsedContent = newContent;
        scope[newContent.name] = newContent.value;
        scopeChanges.add(newContent.name);
        break;
      }
      case "point": {
        const node = parse(expr.parsedContent!.node) as ObjectNode<{
          x: MathNode;
          y: MathNode;
        }>;
        const newContent = pointParser.parse(node, scope);
        expr.parsedContent = newContent;
        // no additions to scopeChanges as
        // it is not stored as a variable
        break;
      }
      case "function": {
        // this means that it is now safe to compute function
        // for dependents
        scopeChanges.add(expr.parsedContent!.name);
        break;
      }
      default: {
        throw new Error(`Type is not implemented.`);
      }
    }

    if (!minHeap.length && scopeHasChanged && uncomputedHeap.length) {
      minHeap = uncomputedHeap;
      uncomputedHeap = new MinHeap<NonNullable<Expression>>(priorityCb);
      scopeHasChanged = false;
    }
  }
};

const deleteScopeSync = (
  items: Item[],
  scope: Scope,
  changedEntry: string,
  changedExpr: Expression
) => {
  // debugger;
  const scopeChanges = new Set(changedEntry);

  const isDependent = (
    expr: Expression,
    scopeChanges: Set<string>
  ): boolean => {
    for (let i = 0; i < expr.parsedContent!.scopeDeps.length; i++) {
      if (scopeChanges.has(expr.parsedContent!.scopeDeps[i])) continue;
      return false;
    }
    return true;
  };

  const priorityCb = (p: Expression, c: Expression) => {
    // if parent is > child => true
    if (isDependent(p, scopeChanges)) return false;
    else if (isDependent(c, scopeChanges)) return true;
    else {
      return (
        p.parsedContent!.scopeDeps.length > c.parsedContent!.scopeDeps.length
      );
    }
  };

  let minHeap = new MinHeap<NonNullable<Expression>>(priorityCb);

  // build heap
  items.forEach((item) => {
    if (item.type === "expression") {
      const expression = item.data as Expression;
      if (
        expression.parsedContent &&
        expression !== changedExpr &&
        expression.parsedContent.scopeDeps.length
      ) {
        minHeap.insert(expression);
      }
    }
  });

  // no items depend on the changed variable
  if (!minHeap.length) return;

  let uncomputedHeap = new MinHeap<NonNullable<Expression>>(priorityCb);
  let scopeHasChanged = false;
  while (minHeap.length) {
    const expr = minHeap.pop();

    if (!isDependent(expr, scopeChanges)) {
      uncomputedHeap.insert(expr);
      continue;
    }

    scopeHasChanged = true;

    switch (expr.type) {
      case "variable": {
        delete scope[expr.parsedContent!.name];
        scopeChanges.add(expr.parsedContent!.name);
        expr.parsedContent = undefined;
        break;
      }
      case "point": {
        expr.parsedContent = undefined;
        break;
      }
      case "function": {
        delete scope[expr.parsedContent!.name];
        scopeChanges.add(expr.parsedContent!.name);
        expr.parsedContent = undefined;
        break;
      }
      default: {
        throw new Error(`Type is not implemented.`);
      }
    }

    if (!minHeap.length && scopeHasChanged && uncomputedHeap.length) {
      minHeap = uncomputedHeap;
      uncomputedHeap = new MinHeap<NonNullable<Expression>>(priorityCb);
      scopeHasChanged = false;
    }
  }
};
