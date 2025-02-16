import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Edit, Plus } from "../../../../components/svgs";
import ExpressionPanelResizer from "./ExpressionPanelResizer";
import GraphMenu from "../menu/GraphMenu";
import DropdownInput from "../../../../components/dropdown/DropdownInput";

const defaultValue = "Untitled";

const ExpressionTopBar = () => {
  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <GraphMenu />
        {/* <h1>{defaultValue}</h1> */}
        <DropdownInput
          className="button--hovered bg-surface-container-low"
          defaultValue={defaultValue}
          initialValue={defaultValue}
        >
          <></>
        </DropdownInput>
      </div>
      <div className="expression-panel-top-bar__right">
        <ButtonTarget className="button--hovered bg-surface-container-low">
          <Plus />
        </ButtonTarget>
        <ButtonTarget className="button--hovered bg-surface-container-low">
          <Edit />
        </ButtonTarget>
        <ExpressionPanelResizer />
      </div>
    </header>
  );
};

export default ExpressionTopBar;
