import { CSS_VARIABLES } from "../../data/css/variables";
import { useClickOutside } from "../../hooks/dom";
import { ChevronDown } from "../svgs";
import styles from "./dropdown.module.scss";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
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
};

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "aria-controls" | "aria-expanded"
> & { children: ReactNode; ref?: React.ForwardedRef<HTMLButtonElement> };

const Dropdown = ({ children, style, className }: DropdownProps) => {
  const mergedClassname = React.useMemo(() => {
    return className ? `${className} ${styles.dropdown}` : styles.dropdown;
  }, [className]);

  return (
    <DropdownContext.Provider value={useInitDropdownContext()}>
      <div className={mergedClassname} style={style}>
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
      onClick={(e) => {
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
      stroke={CSS_VARIABLES.onSurfaceHeading}
      width={16}
      height={16}
    />
  );
};

Dropdown.Menu = <T,>({
  data,
  ListItem,
  onClick,
}: {
  data: T[];
  ListItem: ({
    data,
    handleClick,
  }: {
    data: T;
    handleClick: (arg: T) => void;
  }) => ReactNode;
  onClick: (arg: T) => void;
}) => {
  const { isOpen, setIsOpen } = useDropdownContext();

  const handleClick = useCallback(
    (arg: T) => {
      onClick(arg);
      setIsOpen(false);
    },
    [onClick, isOpen]
  );

  if (!isOpen) return;

  return (
    <ul className={styles.dropdownMenu}>
      {data.map((item, i) => {
        return <ListItem handleClick={handleClick} data={item} key={i} />;
      })}
    </ul>
  );
};
Dropdown.MenuItem = () => {
  return <li>{}</li>;
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
