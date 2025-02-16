import "./assets/base.scss";
import ExpressionList from "./components/list/ExpressionList";
import ExpressionTopBar from "./components/appbar/ExpressionTopBar";

const ExpressionPanel = () => {
  return (
    <div className="expression-panel">
      <ExpressionTopBar />
      <ExpressionList />
    </div>
  );
};

export default ExpressionPanel;
