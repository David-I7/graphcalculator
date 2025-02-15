import "./assets/base.scss";
import ExpressionList from "./components/ExpressionList";
import ExpressionPanelHeader from "./components/ExpressionTopBar";

const ExpressionPanel = () => {
  return (
    <div className="expression-panel">
      <ExpressionPanelHeader />
      <ExpressionList />
    </div>
  );
};

export default ExpressionPanel;
