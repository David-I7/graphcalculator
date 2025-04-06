import FilledButton from "../../../../components/buttons/common/FilledButton";
import { saveGraph } from "../../../../state/graph/graph";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { useGraphContext } from "../../../graph/Graph";

const ExpressionPanelSaveGraph = () => {
  const dispatch = useAppDispatch();
  const isModified = useAppSelector(
    (state) => state.graphSlice.currentGraph.isModified
  );
  const graph = useGraphContext();

  return (
    <FilledButton
      disabled={!isModified}
      style={{ padding: "0 1rem" }}
      onClick={() => {
        if (!graph) return;
        dispatch(saveGraph(graph!));
      }}
    >
      Save
    </FilledButton>
  );
};

export default ExpressionPanelSaveGraph;
