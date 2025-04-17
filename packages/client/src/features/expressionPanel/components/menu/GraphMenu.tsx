import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
import NewBlankGraph from "./NewBlankGraph";
import { useGetUserQuery } from "../../../../state/api/apiSlice";
import GraphPreviews from "./GraphPreviews";
import GraphMenuHeader from "./GraphMenuHeader";

type GraphMenuContext = {
  ariaControlsId: string;
  menuRef: React.RefObject<HTMLDivElement | null>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const GraphMenuContext = createContext<GraphMenuContext | undefined>(undefined);

const useGraphMenuContextSetup = (): GraphMenuContext => {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const isAnimating = useRef<boolean>(false);
  const animationOptions = useRef(
    new KeyframeAnimationOptionsBuilder().build()
  );

  const onClose = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    menuRef.current!.animate(
      AnimateSlideX("0", "-100%"),
      animationOptions.current
    );

    setIsOpen(!isOpen);
    setTimeout(() => {
      isAnimating.current = false;
    }, CSS_VARIABLES.animationSpeedDefault);
  }, [isOpen]);

  const onOpen = useCallback(() => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    menuRef.current!.animate(
      AnimateSlideX("-100%", "0"),
      animationOptions.current
    );

    setIsOpen(!isOpen);
    setTimeout(() => {
      isAnimating.current = false;
    }, CSS_VARIABLES.animationSpeedDefault);
  }, [isOpen]);

  usePopulateRef(mainRef, { cb: () => document.querySelector("main")! });
  usePopulateRef(rootRef, { id: "root" });

  useEffect(() => {
    if (!mainRef.current) return;
    let abortController: AbortController | undefined;

    if (isOpen) {
      mainRef.current.inert = true;
      abortController = new AbortController();
      window.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Escape") onClose();
        },
        { signal: abortController.signal }
      );
    } else {
      mainRef.current.inert = false;
    }

    return () => {
      abortController?.abort();
    };
  }, [isOpen]);

  return {
    menuRef,
    ariaControlsId: id,
    isOpen,
    rootRef,
    onClose,
    onOpen,
  };
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
  const { ariaControlsId, isOpen, rootRef, onOpen, onClose } =
    useGraphMenuContext();

  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);

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
              onClick={onOpen}
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
              top: "0.5rem",
              left: "0.5rem",
              zIndex: "19",
            }}
            message="Open Graph"
            content={(id) => (
              <ButtonTarget
                inert={isOpen}
                aria-describedby={id}
                aria-label="Open main menu"
                aria-expanded={isOpen}
                aria-controls={ariaControlsId}
                className="button--hovered bg-surface-container-low"
                onClick={onOpen}
              >
                <Menu />
              </ButtonTarget>
            )}
          />,
          rootRef.current || document.getElementById("root")!
        )}
      {isOpen && (
        <Scrim
          portal={{ container: rootRef.current! }}
          style={{
            position: "fixed",
            left: "320px",
            right: "auto",
            width: `calc(100vw - 17.625rem)`,
            zIndex: 1000,
          }}
          onClose={onClose}
        />
      )}
    </>
  );
};

GraphMenu.Menu = () => {
  const { ariaControlsId, menuRef, isOpen, rootRef, onClose } =
    useGraphMenuContext();
  const { data: user, isError, isLoading } = useGetUserQuery();

  return createPortal(
    <div
      inert={!isOpen}
      ref={menuRef}
      id={ariaControlsId}
      className="graph-menu"
      role="menu"
    >
      <GraphMenuHeader user={user} />
      <NewBlankGraph handleClick={onClose} />
      <GraphPreviews
        isAuthenticated={user !== undefined}
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>,
    rootRef.current || document.getElementById("root")!
  );
};

export default GraphMenu;
