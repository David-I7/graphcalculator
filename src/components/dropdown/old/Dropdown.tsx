import React, { ReactElement, useState } from "react";
import styles from "./dropdown.module.scss";
import { CSS_VARIABLES } from "../../../data/css/variables";
import { ChevronDown } from "../../svgs";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type ComponentProps = { buttonProps?: ButtonProps; children: ReactElement };

const Dropdown = ({ buttonProps, children }: ComponentProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const clonedChild = React.useMemo(() => {
    if (!React.isValidElement(children)) return null;
    return React.cloneElement<any>(children, {
      ...children.props!,
      isOpen,
    });
  }, [children]);

  const mergedClassname = React.useMemo(() => {
    console.log("computing");
    return buttonProps?.className
      ? `${buttonProps?.className} ${styles.containerButton}`
      : styles.containerButton;
  }, [buttonProps?.className]);

  return (
    <div className={styles.container}>
      <button
        aria-expanded="false"
        aria-controls={""}
        {...buttonProps}
        onClick={(e) => {
          setIsOpen(!isOpen);
        }}
        className={mergedClassname}
      >
        <ChevronDown
          stroke={CSS_VARIABLES.onSurfaceHeading}
          width={16}
          height={16}
        />
      </button>
      {clonedChild}
    </div>
  );
};

export default Dropdown;
