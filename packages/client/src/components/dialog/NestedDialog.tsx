import { DialogHTMLAttributes, ReactNode, useMemo } from "react";
import { isClickOutside } from "../../helpers/dom";
import { CloseDialog } from "./CloseDialog";
import { useDialogContext } from "./DialogContext";
import styles from "./dialog.module.scss";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
};

export const NestedDialog = ({ children, ...dialogAttr }: DialogProps) => {
  const { setIsOpen, ref } = useDialogContext();
  const mergedClassname = useMemo(() => {
    return dialogAttr.className
      ? dialogAttr.className + " " + styles.dialog
      : styles.dialog;
  }, [dialogAttr.className]);

  return (
    <dialog
      ref={ref}
      onClose={(e) => {
        setIsOpen(false);
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isClickOutside(e.currentTarget, e)) {
          ref.current?.close();
        }
      }}
      {...dialogAttr}
      className={mergedClassname}
    >
      {children}
      <CloseDialog ref={ref} />
    </dialog>
  );
};
