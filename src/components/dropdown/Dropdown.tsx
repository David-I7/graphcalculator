import { CSS_VARIABLES } from "../../data/css/variables";
import { ChevronDown } from "../svgs";
import styles from "./dropdown.module.scss";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useId,
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

export default function Dropdown({
  children,
  style,
  className,
}: DropdownProps) {
  const mergedClassname = React.useMemo(() => {
    return className ? `${className} ${styles.dropdown}` : styles.dropdown;
  }, [className]);

  return (
    <DropdownContext.Provider value={useInitDropdownContext()}>
      <div style={style} className={mergedClassname}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

Dropdown.Label = ({ label }: { label: string }) => {
  return label;
};

Dropdown.Button = () => {
  const { isOpen, setIsOpen, ariaControlsID } = useDropdownContext();

  return (
    <button
      onClick={(e) => setIsOpen(!isOpen)}
      aria-controls={ariaControlsID}
      aria-expanded={isOpen}
    >
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
    </button>
  );
};

interface MenuData {
  label: string | number;
}

Dropdown.Menu = ({ data }: { data: MenuData[] }) => {
  return (
    <ul>
      {data.map((item) => (
        <Dropdown.MenuItem item={item} />
      ))}
    </ul>
  );
};
Dropdown.MenuItem = ({ item }: { item: MenuData }) => {
  return <li>{item.label}</li>;
};
