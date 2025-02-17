import { useCallback, useId, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Menu } from "../../../../components/svgs";
import "../../assets/graphmenu.scss";
import { AnimateSlideX, AnimationOptions } from "../../../../lib/animations";
import { usePopulateRef } from "../../../../hooks/reactutils";
import Scrim from "../../../../components/scrim/Scrim";
import { CSS_VARIABLES } from "../../../../data/css/variables";

const GraphMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ariaControlsId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const expressionPanelRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef<boolean>(false);
  const onClose = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    expressionPanelRef.current!.animate(
      AnimateSlideX("17.625rem", "0"),
      AnimationOptions
    );

    setIsOpen(!isOpen);
    setTimeout(() => {
      isAnimating.current = false;
    }, CSS_VARIABLES.animationSpeedDefault);
  }, [isOpen]);

  usePopulateRef(expressionPanelRef, { selector: ".expression-panel" });

  return (
    <>
      <ButtonTarget
        // style={{ width: "36px", height: "36px" }}
        aria-label="Open main menu"
        aria-expanded={isOpen}
        aria-controls={ariaControlsId}
        className="button--hovered bg-surface-container-low"
        onClick={(e) => {
          if (isAnimating.current) return;

          isAnimating.current = true;
          expressionPanelRef.current!.animate(
            AnimateSlideX("0px", "17.625rem"),
            AnimationOptions
          );

          setIsOpen(!isOpen);
          setTimeout(() => {
            isAnimating.current = false;
          }, CSS_VARIABLES.animationSpeedDefault);
        }}
      >
        <Menu />
      </ButtonTarget>
      <div
        ref={menuRef}
        id={ariaControlsId}
        className="graph-menu"
        role="menu"
      ></div>
      {isOpen && (
        <Scrim
          style={{
            left: "0",
            right: "auto",
            width: `calc(100vw - 17.625rem)`,
          }}
          onClose={(e) => {
            onClose();
          }}
        />
      )}
    </>
  );
};

export default GraphMenu;
