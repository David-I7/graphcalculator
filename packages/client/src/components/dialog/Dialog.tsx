import { DialogHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./dialog.module.scss";
import { Close } from "../svgs";
import ButtonTarget from "../buttons/target/ButtonTarget";
import { isClickOutside } from "../../helpers/dom";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
  ref: RefObject<HTMLDialogElement | null>;
};

const Dialog = ({ children, ref, ...dialogAttr }: DialogProps) => {
  const mergedClassname = useMemo(() => {
    return dialogAttr.className
      ? dialogAttr.className + " " + styles.dialog
      : styles.dialog;
  }, [dialogAttr.className]);

  return (
    <dialog
      onClick={(e) => {
        if (isClickOutside(e.currentTarget, e)) {
          ref.current?.close();
        }
      }}
      ref={ref}
      {...dialogAttr}
      className={mergedClassname}
    >
      {children}
      <CloseDialog ref={ref} />
    </dialog>
  );
};

export default Dialog;

function CloseDialog({ ref }: { ref: RefObject<HTMLDialogElement | null> }) {
  return (
    <ButtonTarget
      className={styles.closeDialog}
      onClick={() => ref.current?.close()}
    >
      <Close stroke="white" width={32} height={32} />
    </ButtonTarget>
  );
}
