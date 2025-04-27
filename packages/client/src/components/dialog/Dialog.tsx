import { DialogHTMLAttributes, ReactNode, useMemo } from "react";
import styles from "./dialog.module.scss";
import { isClickOutside } from "../../helpers/dom";
import { useDialogContext } from "./DialogContext";
import { CloseDialog } from "./CloseDialog";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
  responsive?: boolean;
};

const Dialog = ({
  children,
  responsive = true,
  ...dialogAttr
}: DialogProps) => {
  const { setIsOpen, ref } = useDialogContext();
  const mergedClassname = useMemo(() => {
    const base = responsive
      ? styles.dialog.concat(" ", styles.responsive)
      : styles.dialog;

    return dialogAttr.className ? dialogAttr.className + " " + base : base;
  }, [dialogAttr.className]);

  return (
    <dialog
      ref={ref}
      onClose={(e) => setIsOpen(false)}
      onClick={(e) => {
        if (isClickOutside(e.currentTarget, e)) {
          ref.current?.close();
        }
      }}
      {...dialogAttr}
      className={mergedClassname}
    >
      {children}
      <CloseDialog responsive={responsive} ref={ref} />
    </dialog>
  );
};

export default Dialog;
