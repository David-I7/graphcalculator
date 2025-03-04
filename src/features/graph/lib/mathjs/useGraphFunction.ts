import React, { useEffect, useMemo, useRef } from "react";
import { Expression, Scope } from "../../../../state/graph/types";
import { Graph } from "../graph/graph";
import {
  DrawFunctionCommand,
  DrawPointCommand,
  FnCommandState,
  FnState,
} from "../graph/commands";
import { useAppDispatch } from "../../../../state/hooks";
import {
  resetFocusedItem,
  setFocusedItem,
} from "../../../../state/graph/graph";
import { functionParser } from "./parse";
import { reviver } from "mathjs";

type useGraphExprProps<T extends "function" | "point"> = {
  id: number;
  data: Expression<T>;
  focused: boolean;
  graph: Graph;
  scope: Scope;
};
export default function useGraphFunction({
  id,
  data,
  focused,
  graph,
  scope,
}: useGraphExprProps<"function">) {
  console.log(graph);
  const node = useMemo(() => {
    return data.parsedContent
      ? JSON.parse(data.parsedContent, reviver)
      : undefined;
  }, [data.parsedContent]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  useEffect(() => {
    if (!node) return;

    let fnData!: FnState;

    try {
      fnData = functionParser.parse(node, scope);
    } catch (err) {
      // synchronization err
      return;
    }

    const stateSync: FnCommandState = {
      state: focused ? "focused" : "idle",
      onStateChange(prev, cur) {
        if (prev === cur) return;

        if (cur === "idle") {
          dispatch(resetFocusedItem(id));
        } else {
          dispatch(setFocusedItem(id));
        }
      },
    };

    const currentCommand = new DrawFunctionCommand(
      graph,
      fnData,
      data.settings,
      stateSync
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [node, scope]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.state === "idle" && focused) {
      command.current.setState("focused");
    } else if (command.current.state === "focused" && !focused) {
      command.current.setState("idle");
    }
  }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);
}

export function useGraphPoint({
  id,
  data,
  scope,
  focused,
  graph,
}: useGraphExprProps<"point">) {
  const node = useMemo(() => {
    return data.parsedContent ? data.parsedContent : undefined;
  }, [data.parsedContent]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawPointCommand | null>(null);

  useEffect(() => {
    if (!node) return;

    const currentCommand = new DrawPointCommand(
      graph,
      data.parsedContent!,
      data.settings
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [node, scope]);

  // useEffect(() => {
  //   if (!command.current) return;
  //   if (command.current.state === "idle" && focused) {
  //     command.current.setState("focused");
  //   } else if (command.current.state === "focused" && !focused) {
  //     command.current.setState("idle");
  //   }
  // }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);

  return null;
}
