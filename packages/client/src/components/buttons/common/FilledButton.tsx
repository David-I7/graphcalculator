import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./common.module.scss";

type FilledButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: RefObject<HTMLButtonElement | null>;
  buttonType?: "regular" | "danger";
};

const FilledButton = ({
  children,
  ref,
  buttonType = "regular",
  ...props
}: FilledButtonProps) => {
  const mergedClassname = useMemo(() => {
    const base =
      buttonType === "regular"
        ? styles.filledButton
        : styles.filledButtonDanger;

    return props.className ? props.className + " " + base : base;
  }, [props.className]);

  return (
    <button ref={ref} {...props} className={mergedClassname}>
      {children}
    </button>
  );
};

export default FilledButton;
