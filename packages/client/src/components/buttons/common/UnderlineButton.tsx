import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./common.module.scss";

type UnderlineButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: RefObject<HTMLButtonElement | null>;
  buttonType?: "link" | "button";
};

const UnderlineButton = ({
  children,
  ref,
  buttonType = "button",
  ...props
}: UnderlineButtonProps) => {
  const mergedClassname = useMemo(() => {
    const base =
      buttonType === "button"
        ? styles.underlineButton
        : styles.underlineButtonLink;
    return props.className ? props.className + " " + base : base;
  }, [props.className]);

  return (
    <button ref={ref} {...props} className={mergedClassname}>
      {children}
    </button>
  );
};

export default UnderlineButton;
