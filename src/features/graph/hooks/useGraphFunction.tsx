import { useEffect, useMemo, useRef } from "react";
import {
  CommandState,
  DrawFunctionCommand,
  FnState,
} from "../lib/graph/commands";
import { resetFocusedItem, setFocusedItem } from "../../../state/graph/graph";
import { functionParser } from "../lib/mathjs/parse";
import { useAppDispatch } from "../../../state/hooks";
import { reviver } from "mathjs";
import { useGraphContext } from "../Graph";
import { useGraphExprProps } from "../components/GraphExpression";

function useGraphFunction({
  id,
  data,
  focused,
  scope,
}: useGraphExprProps<"function">) {
  const graph = useGraphContext();
  const node = useMemo(() => {
    return data.parsedContent
      ? JSON.parse(data.parsedContent.node, reviver)
      : undefined;
  }, [data.parsedContent]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  useEffect(() => {
    if (!node || !graph) return;

    let fnData!: FnState;

    try {
      fnData = functionParser.parse(node, scope);
    } catch (err) {
      // synchronization err
      // console.log(err);
      return;
    }

    const stateSync: CommandState = {
      status: focused ? "focused" : "idle",
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
  }, [node, scope, graph]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.commandState.status === "idle" && focused) {
      command.current.setStatus("focused");
    } else if (command.current.commandState.status === "focused" && !focused) {
      command.current.setStatus("idle");
    }
  }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);
}

export const GraphFunction = ({
  data,
  id,
  focused,
  scope,
}: useGraphExprProps<"function">) => {
  useGraphFunction({ id, focused, data, scope });

  return null;
};
