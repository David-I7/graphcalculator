import { CSS_VARIABLES } from "../../data/css/variables";
import { useClickOutside } from "../../hooks/dom";
import { ChevronDown } from "../svgs";
import styles from "./dropdown.module.scss";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type DropdownContextState =
  | {
      isOpen: boolean;
      setIsOpen: React.Dispatch<SetStateAction<boolean>>;
      ariaControlsID: string;
    }
  | undefined;

export const DropdownContext = createContext<DropdownContextState>(undefined);
export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context)
    throw new Error("Context can only be used by dropdowns children");
  return context;
};

const useInitDropdownContext = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ariaControlsID = useId();

  return { isOpen, setIsOpen, ariaControlsID };
};

type DropdownProps = {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
};

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "aria-controls" | "aria-expanded"
> & { children: ReactNode; ref?: React.ForwardedRef<HTMLButtonElement> };

const Dropdown = ({ children, style, className, ref }: DropdownProps) => {
  const mergedClassname = React.useMemo(() => {
    return className ? `${className} ${styles.dropdown}` : styles.dropdown;
  }, [className]);

  return (
    <DropdownContext.Provider value={useInitDropdownContext()}>
      <div ref={ref} className={mergedClassname} style={style}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export default Dropdown;

Dropdown.Label = ({ label }: { label: string }) => {
  return label;
};

Dropdown.Button = ({ children, ref, ...rest }: ButtonProps) => {
  const { isOpen, setIsOpen, ariaControlsID } = useDropdownContext();
  const internalRef = useRef<HTMLButtonElement>(null);
  const mergedRef = ref || internalRef;

  useClickOutside(isOpen, mergedRef as React.RefObject<HTMLButtonElement>, () =>
    setIsOpen(!isOpen)
  );

  return (
    <button
      ref={mergedRef}
      {...rest}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
      aria-controls={ariaControlsID}
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
};

Dropdown.Chevron = () => {
  const { isOpen } = useDropdownContext();

  return (
    <ChevronDown
      style={
        isOpen
          ? {
              transform: "rotate(-180deg)",
              transition: "transform 150ms ease-out",
            }
          : {
              transform: "",
              transition: "transform 150ms ease-out",
            }
      }
      width={16}
      height={16}
    />
  );
};

export type CustomMenuProps = {
  isOpen: boolean;
  ariaControlsId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: ReactNode;
};

Dropdown.CustomMenu = ({
  Menu,
  children,
}: {
  Menu: (props: CustomMenuProps) => ReactNode;
  children: ReactNode;
}) => {
  const { isOpen, setIsOpen, ariaControlsID } = useDropdownContext();

  return (
    <>
      {isOpen && (
        <Menu isOpen ariaControlsId={ariaControlsID} setIsOpen={setIsOpen}>
          {children}
        </Menu>
      )}
    </>
  );
};

Dropdown.Menu = <T,>({
  data,
  ListItem,
  onClick,
}: {
  data: T[];
  onClick: (arg: T) => void;
  ListItem: ({
    data,
    handleClick,
  }: {
    data: T;
    handleClick: (arg: T) => void;
  }) => ReactNode;
}) => {
  const { isOpen, setIsOpen, ariaControlsID } = useDropdownContext();
  const ref = useRef<HTMLUListElement>(null);

  const handleClick = useCallback(
    (arg: T) => {
      onClick(arg);
      setIsOpen(false);
    },
    [onClick, isOpen]
  );

  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const dropdown = ref.current;
    const contentRect = dropdown.getBoundingClientRect();
    if (contentRect.left <= 0) {
      dropdown.style.translate = `${Math.abs(contentRect.left) + 2}px`;
    } else if (contentRect.right >= window.innerWidth) {
      const offset = contentRect.right - window.innerWidth;
      dropdown.style.translate = `-${offset + 2}px`;
    }
  }, [isOpen]);

  if (!isOpen) return;

  return (
    <>
      <ul ref={ref} className={styles.dropdownMenu} id={ariaControlsID}>
        {data.map((item, i) => {
          return <ListItem handleClick={handleClick} data={item} key={i} />;
        })}
      </ul>
      <div className={styles.dropdownMenuTriangle}>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

Dropdown.DialogMenu = ({
  children,
}: {
  children: ReactElement<{ toggle: () => void }>;
}) => {
  const { isOpen, setIsOpen, ariaControlsID } = useDropdownContext();
  const ref = useRef<HTMLUListElement>(null);
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const dropdown = ref.current;
    const contentRect = dropdown.getBoundingClientRect();
    if (contentRect.left <= 0) {
      dropdown.style.translate = `${Math.abs(contentRect.left) + 2}px`;
    } else if (contentRect.right >= window.innerWidth) {
      const offset = contentRect.right - window.innerWidth;
      dropdown.style.translate = `-${offset + 2}px`;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <ul ref={ref} className={styles.dropdownMenu} id={ariaControlsID}>
        {React.cloneElement(children, { toggle })}
      </ul>
      <div className={styles.dropdownMenuTriangle}>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

// Convinience component over styling a dropdown as a button

export const DropdownButton = ({
  children,
  style,
  className,
}: DropdownProps) => {
  const mergedClassname = React.useMemo(() => {
    return className
      ? `${className} ${styles.dropdownButton}`
      : styles.dropdownButton;
  }, [className]);
  className = mergedClassname;
  return (
    <DropdownContext.Provider value={useInitDropdownContext()}>
      <div className={mergedClassname} style={style}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
