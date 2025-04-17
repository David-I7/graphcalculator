import ExpressionPanelResizer from "./ExpressionPanelResizer";
import GraphMenu from "../menu/GraphMenu";
import ExpressionPanelNewItem from "./ExpressionPanelNewItem";
import ExpressionPanelSaveGraph from "./saveGraph/ExpressionPanelSaveGraph";
import ExpressionPanelGraphName from "./ExpressionPanelGraphName";

const ExpressionTopBar = () => {
  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <GraphMenu>
          <GraphMenu.Toggle />
          <GraphMenu.Menu />
        </GraphMenu>
        {/* <h1>{defaultValue}</h1> */}
        <ExpressionPanelGraphName />
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
