import "./assets/base.scss";
import ExpressionList from "./components/ExpressionList";
import ExpressionPanelHeader from "./components/ExpressionPanelHeader";
import ExpressionPanelResizer from "./components/ExpressionPanelResizer";

const ExpressionPanel = () => {
  return (
    <div className="expression-panel">
      <ExpressionPanelHeader />
      <ExpressionList />
      <ExpressionPanelResizer />
    </div>
  );
};

export default ExpressionPanel;
