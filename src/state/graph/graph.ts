import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GraphData, ExpressionType, Expression } from "../../lib/api/graph";

interface GraphState {
  currentGraph: GraphData;
  savedGraphs: GraphData[];
}

function createNewGraph(): GraphData {
  const createdAt = new Date().toJSON();
  return {
    id: crypto.randomUUID(),
    createdAt,
    modifiedAt: createdAt,
    thumb: "",
    name: "Untitled",
    expressions: [createNewExpression("expr", 1)],
  };
}

function createNewExpression(type: ExpressionType, id: number): Expression {
  return {
    id,
    type,
    content: "",
  };
}

function swap<T>(a: number, b: number, arr: T[]) {
  const tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}

const initialState: GraphState = {
  currentGraph: createNewGraph(),
  savedGraphs: [],
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: (create) => ({
    // GRAPH CASES
    restoreGraph: create.reducer((state, action: PayloadAction<string>) => {
      const graph = state.savedGraphs.find(
        (graph) => graph.id === action.payload
      );
      if (!graph) return;
      state.currentGraph = graph;
    }),
    saveGraph: create.reducer((state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        state.savedGraphs.push(state.currentGraph);
      } else {
        for (let i = 0; i < state.savedGraphs.length; ++i) {
          if (state.savedGraphs[i].id === action.payload) {
            state.savedGraphs[i] = state.currentGraph;
          }
        }
      }
    }),

    // EXPRESSION CASES
    createExpression: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          type: ExpressionType;
          loc: "start" | "end";
        }>
      ) => {
        if (action.payload.loc === "end") {
          state.currentGraph.expressions.push(
            createNewExpression(action.payload.type, action.payload.id)
          );
        } else {
          state.currentGraph.expressions.unshift(
            createNewExpression(action.payload.type, action.payload.id)
          );
        }
      }
    ),
    deleteExpression: create.reducer((state, action: PayloadAction<number>) => {
      for (let i = 0; i < state.currentGraph.expressions.length; ++i) {
        if (state.currentGraph.expressions[i].id === action.payload) {
          state.currentGraph.expressions.splice(i, 1);
          break;
        }
      }
    }),
    updateExpressionPos: create.reducer(
      (
        state,
        action: PayloadAction<{ id: number; startPos: number; endPos: number }>
      ) => {
        if (
          state.currentGraph.expressions[action.payload.startPos].id !==
          action.payload.id
        )
          return;

        const exprLength = state.currentGraph.expressions.length;
        if (
          !(
            action.payload.startPos < exprLength &&
            action.payload.startPos >= 0 &&
            action.payload.endPos >= 0 &&
            action.payload.endPos < exprLength
          )
        )
          return;

        if (action.payload.startPos < action.payload.endPos) {
          let i = action.payload.startPos;
          while (i < action.payload.startPos) {
            swap(i, i + 1, state.currentGraph.expressions);
            ++i;
          }
        } else if (action.payload.startPos > action.payload.endPos) {
          let i = action.payload.startPos;
          while (i > action.payload.endPos) {
            swap(i, i - 1, state.currentGraph.expressions);
            --i;
          }
        }
      }
    ),
    updateExpressionContent: create.reducer(
      (state, action: PayloadAction<{ content: string; id: number }>) => {
        for (let i = 0; i < state.currentGraph.expressions.length; ++i) {
          if (state.currentGraph.expressions[i].id === action.payload.id) {
            state.currentGraph.expressions[i].content = action.payload.content;
            break;
          }
        }
      }
    ),
  }),
});

export default graphSlice.reducer;
export const {
  restoreGraph,
  saveGraph,
  updateExpressionContent,
  updateExpressionPos,
  createExpression,
  deleteExpression,
} = graphSlice.actions;
