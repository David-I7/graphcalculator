import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { ResizableInput } from "../../../../components/input/ResizableInput";
import { changeGraphName } from "../../../../state/graph/graph";

const ExpressionPanelGraphName = () => {
  const dispatch = useAppDispatch();
  const graphName = useAppSelector(
    (state) => state.graphSlice.currentGraph.name
  );

  return (
    <ResizableInput
      onSave={(title) => dispatch(changeGraphName(title))}
      inputProps={{
        className: "button--hovered bg-surface-container-low",
      }}
      defaultValue={"Untitled"}
      initialValue={graphName}
    />
  );
};

export default ExpressionPanelGraphName;
