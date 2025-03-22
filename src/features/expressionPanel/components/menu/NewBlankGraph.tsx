import React from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Plus } from "../../../../components/svgs";
import { CSS_VARIABLES } from "../../../../data/css/variables";

const NewBlankGraph = () => {
  return (
    <div role="button" tabIndex={0} className="new-blank-graph">
      <ButtonTarget tabIndex={-1}>
        <Plus />
      </ButtonTarget>
      New blank graph
    </div>
  );
};

export default NewBlankGraph;
