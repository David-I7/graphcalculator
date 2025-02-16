import { useId, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Menu } from "../../../../components/svgs";
import "../../assets/graphmenu.scss";

const GraphMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ariaControlsId = useId();
  return (
    <>
      <ButtonTarget
        aria-label="Open main menu"
        aria-expanded={isOpen}
        aria-controls={ariaControlsId}
        className="button--hovered bg-surface-container-low"
        onClick={(e) => {
          setIsOpen(!isOpen);
        }}
      >
        <Menu />
      </ButtonTarget>
      <div id={ariaControlsId} className="graph-menu" role="menu"></div>
    </>
  );
};

export default GraphMenu;
