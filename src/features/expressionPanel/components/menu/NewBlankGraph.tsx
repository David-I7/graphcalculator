import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Plus } from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import { createBlankGraph } from "../../../../state/graph/graph";
import { useGraphContext } from "../../../graph/Graph";
import { createNewGraph } from "../../../../state/graph/controllers";

const NewBlankGraph = ({ handleClick }: { handleClick: () => void }) => {
  const dispatch = useAppDispatch();
  const graph = useGraphContext();
  return (
    <div
      onClick={() => {
        if (!graph) return;
        const newGraph = createNewGraph();
        graph.restoreStateSnapshot(newGraph.graphSnapshot);
        dispatch(createBlankGraph(newGraph));
        handleClick();
      }}
      role="button"
      tabIndex={0}
      className="new-blank-graph"
    >
      <ButtonTarget tabIndex={-1}>
        <Plus />
      </ButtonTarget>
      New blank graph
    </div>
  );
};

export default NewBlankGraph;
