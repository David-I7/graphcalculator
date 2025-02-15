import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import { ArrowLeft, Edit, Plus } from "../../../components/svgs";
import DropdownInput from "../../../components/dropdown/DropdownInput";
import Dropdown from "../../../components/dropdown/Dropdown";
import ExpressionPanelResizer from "./ExpressionPanelResizer";

const defaultValue = "Untitled";

const ExpressionTopBar = () => {
  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <DropdownInput
          defaultValue={defaultValue}
          initialValue={defaultValue}
          className={"bg-surface-container-low button--hovered"}
          onSave={() => {
            console.log("db save");
          }}
        >
          <Dropdown
            style={{
              paddingInline: "0.25rem",
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
            }}
            className="button--hovered bg-surface-container-low"
          >
            <Dropdown.Button />
          </Dropdown>
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
