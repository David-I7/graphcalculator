import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GraphData, ExpressionType, Expression } from "../../lib/api/graph";
import { CSS_VARIABLES } from "../../data/css/variables";

interface GraphState {
  currentGraph: ClientGraphState;
  savedGraphs: GraphData[];
  exampleGraphs: GraphData[];
}

type ClientGraphState = Omit<GraphData, "expressions"> & {
  expressions: { nextId: number; focusedId: number; data: Expression[] };
};

function createNewGraph(): ClientGraphState {
  const createdAt = new Date().toJSON();
  return {
    id: crypto.randomUUID(),
    createdAt,
    modifiedAt: createdAt,
    thumb: "",
    name: "Untitled",
    expressions: {
      nextId: 2,
      focusedId: 1,
      data: [createNewExpression("expression", 1)],
    },
  };
}

function createNewExpression(
  type: ExpressionType,
  id: number,
  content?: string
): Expression {
  if (type === "expression") {
    return {
      id,
      type,
      data: {
        content: content ? content : "",
        color: `hsl(${Math.floor(Math.random() * 360)},${
          CSS_VARIABLES.baseSaturation
        },${CSS_VARIABLES.baseLightness})`,
        hidden: false,
      },
    };
  }

  return {
    id,
    type,
    data: {
      content: "",
    },
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
  exampleGraphs: [],
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
      // state.currentGraph = graph;
    }),
    saveGraph: create.reducer((state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        // state.savedGraphs.push(state.currentGraph);
      } else {
        // for (let i = 0; i < state.savedGraphs.length; ++i) {
        //   if (state.savedGraphs[i].id === action.payload) {
        //     state.savedGraphs[i] = state.currentGraph;
        //   }
        // }
      }
    }),

    // EXPRESSION CASES
    createExpression: create.reducer(
      (
        state,
        action: PayloadAction<{
          type: ExpressionType;
          loc: "start" | "end";
        }>
      ) => {
        if (action.payload.loc === "end") {
          state.currentGraph.expressions.data.push(
            createNewExpression(
              action.payload.type,
              state.currentGraph.expressions.nextId
            )
          );
        } else {
          state.currentGraph.expressions.data.unshift(
            createNewExpression(
              action.payload.type,
              state.currentGraph.expressions.nextId
            )
          );
        }
        state.currentGraph.expressions.focusedId =
          state.currentGraph.expressions.nextId;
        state.currentGraph.expressions.nextId += 1;
      }
    ),
    deleteExpression: create.reducer(
      (state, action: PayloadAction<{ id: number; idx: number }>) => {
        const expressions = state.currentGraph.expressions;

        if (expressions.data[action.payload.idx].id !== action.payload.id)
          return;

        expressions.data.splice(action.payload.idx, 1);
      }
    ),
    updateExpressionPos: create.reducer(
      (
        state,
        action: PayloadAction<{ id: number; startPos: number; endPos: number }>
      ) => {
        if (action.payload.startPos < action.payload.endPos) {
          let i = action.payload.startPos;
          while (i < action.payload.endPos) {
            swap(i, i + 1, state.currentGraph.expressions.data);
            ++i;
          }
        } else if (action.payload.startPos > action.payload.endPos) {
          let i = action.payload.startPos;
          while (i > action.payload.endPos) {
            swap(i, i - 1, state.currentGraph.expressions.data);
            --i;
          }
        }
      }
    ),
    updateExpressionContent: create.reducer(
      (
        state,
        action: PayloadAction<{ content: string; id: number; idx: number }>
      ) => {
        const expr = state.currentGraph.expressions.data[action.payload.idx];
        if (expr.id !== action.payload.id) return;
        if (expr.data.content === action.payload.content) return;
        expr.data.content = action.payload.content;
      }
    ),
    toggleExpressionVisibility: create.reducer(
      (
        state,
        action: PayloadAction<{ hidden: boolean; id: number; idx: number }>
      ) => {
        const expr = state.currentGraph.expressions.data[
          action.payload.idx
        ] as Expression<"expression">;

        if (expr.id !== action.payload.id) return;

        expr.data.hidden = !expr.data.hidden;
      }
    ),
    setFocusedExpression: create.reducer(
      (state, action: PayloadAction<number>) => {
        if (state.currentGraph.expressions.focusedId === action.payload) return;
        state.currentGraph.expressions.focusedId = action.payload;
      }
    ),
    resetFocusedExpression: create.reducer(
      (state, action: PayloadAction<number>) => {
        if (state.currentGraph.expressions.focusedId === action.payload) {
          state.currentGraph.expressions.focusedId = -1;
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
  toggleExpressionVisibility,
  createExpression,
  deleteExpression,
  setFocusedExpression,
  resetFocusedExpression,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};
