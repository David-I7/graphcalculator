import ExpressionPanelResizer from "./ExpressionPanelResizer";
import GraphMenu from "../menu/GraphMenu";
import { ResizableInput } from "../../../../components/input/ResizableInput";
import ExpressionPanelNewItem from "./ExpressionPanelNewItem";
import ExpressionPanelSaveGraph from "./ExpressionPanelSaveGraph";
import { useAppDispatch } from "../../../../state/hooks";
import { changeGraphName } from "../../../../state/graph/graph";

const ExpressionTopBar = () => {
  const dispatch = useAppDispatch();
  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <GraphMenu>
          <GraphMenu.Toggle />
          <GraphMenu.Menu />
        </GraphMenu>
        {/* <h1>{defaultValue}</h1> */}
        <ResizableInput
          onSave={(title) => dispatch(changeGraphName(title))}
          inputProps={{
            className: "button--hovered bg-surface-container-low",
          }}
          defaultValue={"Untitled"}
          initialValue={"Untitled"}
        />
      </div>
      <div className="expression-panel-top-bar__right">
        <ExpressionPanelSaveGraph />
        <ExpressionPanelNewItem />
        <ExpressionPanelResizer />
      </div>
    </header>
  );
};

export default ExpressionTopBar;
