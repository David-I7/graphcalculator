import {
  createContext,
  ReactNode,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Menu } from "../../../../components/svgs";
import "../../assets/graphmenu.scss";
import {
  AnimateSlideX,
  KeyframeAnimationOptionsBuilder,
} from "../../../../lib/animations";
import { usePopulateRef } from "../../../../hooks/reactutils";
import Scrim from "../../../../components/scrim/Scrim";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useAppSelector } from "../../../../state/hooks";
import { createPortal } from "react-dom";
import Tooltip from "../../../../components/tooltip/Tooltip";

type GraphMenuContext = {
  ariaControlsId: string;
  menuRef: React.RefObject<HTMLDivElement | null>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

const GraphMenuContext = createContext<GraphMenuContext | undefined>(undefined);

const useGraphMenuContextSetup = (): GraphMenuContext => {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);

  usePopulateRef(rootRef, { id: "root" });

  return { menuRef, ariaControlsId: id, isOpen, setIsOpen, rootRef };
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
  const { ariaControlsId, menuRef, isOpen, setIsOpen, rootRef } =
    useGraphMenuContext();
  const animationOptions = useRef(
    new KeyframeAnimationOptionsBuilder().build()
  );
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const isAnimating = useRef<boolean>(false);
  const expressionPanelRef = useRef<HTMLDivElement>(null);
  const onClose = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    expressionPanelRef.current!.animate(
      AnimateSlideX("17.625rem", "0"),
      animationOptions.current
    );
    menuRef.current!.animate(
      AnimateSlideX("0", "-100%"),
      animationOptions.current
    );

    setIsOpen(!isOpen);
    setTimeout(() => {
      isAnimating.current = false;
    }, CSS_VARIABLES.animationSpeedDefault);
  };

  usePopulateRef(expressionPanelRef, { selector: ".expression-panel" });

  return (
    <>
      {!isMobile && (
        <Tooltip
          message="Open Graph"
          content={(id) => (
            <ButtonTarget
              aria-describedby={id}
              aria-label="Open Graph"
              aria-expanded={isOpen}
              aria-controls={ariaControlsId}
              className="button--hovered bg-surface-container-low"
              onClick={(e) => {
                if (isAnimating.current) return;

                isAnimating.current = true;
                expressionPanelRef.current!.animate(
                  AnimateSlideX("0px", "17.625rem"),
                  animationOptions.current
                );
                menuRef.current!.animate(
                  AnimateSlideX("-100%", "0"),
                  animationOptions.current
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
        />
      )}
      {isMobile &&
        createPortal(
          <Tooltip
            style={{
              position: "fixed",
              top: "1rem",
              left: "1rem",
              zIndex: "19",
            }}
            message="Open Graph"
            content={(id) => (
              <ButtonTarget
                aria-describedby={id}
                aria-label="Open main menu"
                aria-expanded={isOpen}
                aria-controls={ariaControlsId}
                className="button--hovered bg-surface-container-low"
                onClick={(e) => {
                  if (isAnimating.current) return;

                  isAnimating.current = true;
                  expressionPanelRef.current!.animate(
                    AnimateSlideX("0px", "17.625rem"),
                    animationOptions.current
                  );
                  menuRef.current!.animate(
                    AnimateSlideX("-100%", "0"),
                    animationOptions.current
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
          />,
          rootRef.current || document.getElementById("root")!
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
  const { ariaControlsId, menuRef, isOpen, rootRef } = useGraphMenuContext();
  const isAuthenticated = useAppSelector(
    (state) => state.globalSlice.isAuthenticated
  );

  return createPortal(
    <div
      aria-hidden={!isOpen}
      ref={menuRef}
      id={ariaControlsId}
      className="graph-menu"
      role="menu"
    >
      {!isAuthenticated && (
        <header>Login to save your beautiful graphs!</header>
      )}
      {isAuthenticated && <header>Logout controls; Search controls</header>}

      <button>new blank graph</button>
      {isAuthenticated && (
        <>
          <section>
            <h2>Current Graph</h2>
          </section>
          <section>
            <h2>Saved Graphs</h2>
          </section>
        </>
      )}
      <section>
        <h2>Examples</h2>
      </section>
    </div>,
    rootRef.current || document.getElementById("root")!
  );
};

export default GraphMenu;
