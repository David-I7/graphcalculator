import { useEffect, useState } from "react";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import { saveGraph } from "../../../../state/graph/graph";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { useGraphContext } from "../../../graph/Graph";
import { useInitialRender, usePrevious } from "../../../../hooks/reactutils";

const ExpressionPanelSaveGraph = () => {
  const dispatch = useAppDispatch();
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const graph = useGraphContext();
  const [disabled, setDisabled] = useState<boolean>(true);
  const initalRender = useInitialRender();
  const prevId = usePrevious(currentGraph.id, currentGraph.id);

  useEffect(() => {
    if (!graph || initalRender) return;
    if (prevId !== currentGraph.id) {
      if (!disabled) setDisabled(true);
    }
    if (disabled) setDisabled(false);
  }, [currentGraph.name, currentGraph.items.data]);

  return (
    <FilledButton
      disabled={disabled}
      style={{ padding: "0 1rem" }}
      onClick={(e) => {
        const stateSnapshot = graph!.getStateSnapshot();
        dispatch(saveGraph({ ...stateSnapshot, image: graph!.toDataURL() }));
        setDisabled(true);
      }}
    >
      Save
    </FilledButton>
  );
};

export default ExpressionPanelSaveGraph;
