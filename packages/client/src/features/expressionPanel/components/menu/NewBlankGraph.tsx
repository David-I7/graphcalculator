import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Plus } from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import { createBlankGraph } from "../../../../state/graph/graph";
import { useGraphContext } from "../../../graph/Graph";

const NewBlankGraph = ({ handleClick }: { handleClick: () => void }) => {
  const dispatch = useAppDispatch();
  const graph = useGraphContext();
  return (
    <div
      onClick={() => {
        if (!graph) return;
        dispatch(createBlankGraph(graph));
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
