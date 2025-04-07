import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./common.module.scss";

type OutlinedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: RefObject<HTMLButtonElement | null>;
  theme?: "dark" | "light";
};

const OutlinedButton = ({
  children,
  theme = "light",
  ref,
  ...props
}: OutlinedButtonProps) => {
  const mergedClassname = useMemo(() => {
    let base = props.className ?? "";
    if (theme === "light") base = base + " " + styles.outlinedButton;
    else base = base + " " + styles.outlinedButtonDark;

    return base;
  }, [props.className]);

  return (
    <button ref={ref} {...props} className={mergedClassname}>
      {children}
    </button>
  );
};

export default OutlinedButton;
