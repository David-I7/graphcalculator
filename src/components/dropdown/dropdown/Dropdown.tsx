import React from "react";
import styles from "./dropdown.module.scss";
import { ChevronDown } from "../../svgs";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type ComponentProps = ButtonProps;

const Dropdown = (p: ComponentProps) => {
  return (
    <div className={styles.container}>
      <button>
        <ChevronDown />
      </button>
    </div>
  );
};

export default Dropdown;
