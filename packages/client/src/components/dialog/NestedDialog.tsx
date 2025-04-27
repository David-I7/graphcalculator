import { DialogHTMLAttributes, ReactNode, useMemo } from "react";
import { isClickOutside } from "../../helpers/dom";
import { CloseDialog } from "./CloseDialog";
import { useDialogContext } from "./DialogContext";
import styles from "./dialog.module.scss";

type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  children: ReactNode;
  responsive?: boolean;
};

export const NestedDialog = ({
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
      <CloseDialog responsive={responsive} ref={ref} />
    </dialog>
  );
};
