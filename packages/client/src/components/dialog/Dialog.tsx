import { DialogHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./dialog.module.scss";
import { Close } from "../svgs";
import ButtonTarget from "../buttons/target/ButtonTarget";
import { isClickOutside } from "../../helpers/dom";
import { useDialogContext } from "./DialogContext";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
};

const Dialog = ({ children, ...dialogAttr }: DialogProps) => {
  const { setIsOpen, ref } = useDialogContext();
  const mergedClassname = useMemo(() => {
    return dialogAttr.className
      ? dialogAttr.className + " " + styles.dialog
      : styles.dialog;
  }, [dialogAttr.className]);

  return (
    <dialog
      onClose={(e) => setIsOpen(false)}
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
