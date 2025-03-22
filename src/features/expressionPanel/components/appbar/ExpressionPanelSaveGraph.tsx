import { useEffect, useRef, useState } from "react";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import { statesSnapshotsAreEqual } from "../../../../state/graph/controllers";
import { saveGraph } from "../../../../state/graph/graph";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { useGraphContext } from "../../../graph/Graph";
import { useInitialRender } from "../../../../hooks/reactutils";

const ExpressionPanelSaveGraph = () => {
  const dispatch = useAppDispatch();
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const graph = useGraphContext();
  const [disabled, setDisabled] = useState<boolean>(true);
  const initalRender = useInitialRender();

  useEffect(() => {
    if (!graph || initalRender) return;
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
