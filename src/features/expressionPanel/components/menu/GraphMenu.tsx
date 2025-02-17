import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Menu } from "../../../../components/svgs";
import "../../assets/graphmenu.scss";
import { AnimateSlideX, AnimationOptions } from "../../../../lib/animations";
import { usePopulateRef } from "../../../../hooks/reactutils";
import Scrim from "../../../../components/scrim/Scrim";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useAppSelector } from "../../../../state/hooks";
import { createPortal } from "react-dom";

type GraphMenuContext = {
  ariaControlsId: string;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

const GraphMenuContext = createContext<GraphMenuContext | undefined>(undefined);

const useGraphMenuContextSetup = (): GraphMenuContext => {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  return { menuRef, ariaControlsId: id };
};

const useGraphMenuContext = () => {
  const ctx = useContext(GraphMenuContext);
  if (!ctx)
    throw new Error("Graph menu context cannot be accessed outside its scope");

  return ctx;
};

const GraphMenu = ({ children }: { children: ReactNode }) => {
  return (
    <GraphMenuContext.Provider value={useGraphMenuContextSetup()}>
      {children}
    </GraphMenuContext.Provider>
  );
};

GraphMenu.Toggle = function () {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { ariaControlsId, menuRef } = useGraphMenuContext();
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const isAnimating = useRef<boolean>(false);
  const expressionPanelRef = useRef<HTMLDivElement>(null);
  const onClose = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    expressionPanelRef.current!.animate(
      AnimateSlideX("17.625rem", "0"),
      AnimationOptions
    );
    menuRef.current!.animate(AnimateSlideX("0", "-100%"), AnimationOptions);

    setIsOpen(!isOpen);
    setTimeout(() => {
      isAnimating.current = false;
    }, CSS_VARIABLES.animationSpeedDefault);
  };

  usePopulateRef(expressionPanelRef, { selector: ".expression-panel" });

  return (
    <>
      {!isMobile && (
        <ButtonTarget
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
            menuRef.current!.animate(
              AnimateSlideX("-100%", "0"),
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
      )}
      {isMobile &&
        createPortal(
          <ButtonTarget
            style={{
              position: "fixed",
              top: "1rem",
              left: "1rem",
              zIndex: "19",
            }}
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
              menuRef.current!.animate(
                AnimateSlideX("-100%", "0"),
                AnimationOptions
              );

              setIsOpen(!isOpen);
              setTimeout(() => {
                isAnimating.current = false;
              }, CSS_VARIABLES.animationSpeedDefault);
            }}
          >
            <Menu />
          </ButtonTarget>,
          document.getElementById("root")!
        )}
      {isOpen && (
        <Scrim
          portal={{ container: menuRef.current! }}
          style={{
            left: "100%",
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

GraphMenu.Menu = () => {
  const { ariaControlsId, menuRef } = useGraphMenuContext();

  useEffect(() => {}, []);

  return createPortal(
    <div
      ref={menuRef}
      id={ariaControlsId}
      className="graph-menu"
      role="menu"
    ></div>,
    document.getElementById("root")!
  );
};

export default GraphMenu;
