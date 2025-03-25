import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import { Home, Minus, Plus } from "../../../components/svgs";
import Hr from "../../../components/hr/Hr";
import Tooltip from "../../../components/tooltip/Tooltip";
import useScaleGraph from "../hooks/useScaleGraph";

const GraphScaler = () => {
  const { resetScales, scaleGraph } = useScaleGraph();

  return (
    <div className="graph-scaler">
      <div className="graph-scaler-top">
        <Tooltip
          fixedPosition="left"
          message="Zoom In"
          content={(id) => (
            <ButtonTarget
              onClick={() => scaleGraph("IN")}
              aria-describedby={id}
              className="graph-scaler-top-zoom-in button--hovered bg-surface-container-low"
            >
              <Plus />
            </ButtonTarget>
          )}
        />
        <Hr />
        <Tooltip
          fixedPosition="left"
          message="Zoom Out"
          content={(id) => (
            <ButtonTarget
              onClick={() => scaleGraph("OUT")}
              aria-describedby={id}
              className="graph-scaler-top-zoom-out button--hovered bg-surface-container-low"
            >
              <Minus />
            </ButtonTarget>
          )}
        />
      </div>
      <Tooltip
        fixedPosition="left"
        message="Default Viewport"
        content={(id) => (
          <ButtonTarget
            onClick={resetScales}
            aria-describedby={id}
            className="button--hovered bg-surface-container-low"
          >
            <Home />
          </ButtonTarget>
        )}
      />
    </div>
  );
};

export default GraphScaler;
