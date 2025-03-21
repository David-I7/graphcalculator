import ExpressionPanelResizer from "./ExpressionPanelResizer";
import GraphMenu from "../menu/GraphMenu";
import { ResizableInput } from "../../../../components/input/ResizableInput";
import ExpressionPanelNewItem from "./ExpressionPanelNewItem";

const defaultValue = "Untitled";

const ExpressionTopBar = () => {
  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <GraphMenu>
          <GraphMenu.Toggle />
          <GraphMenu.Menu />
        </GraphMenu>
        {/* <h1>{defaultValue}</h1> */}
        <ResizableInput
          inputProps={{
            className: "button--hovered bg-surface-container-low",
          }}
          defaultValue={defaultValue}
          initialValue={defaultValue}
        />
      </div>
      <div className="expression-panel-top-bar__right">
        <ExpressionPanelNewItem />
        <ExpressionPanelResizer />
      </div>
    </header>
  );
};

export default ExpressionTopBar;
