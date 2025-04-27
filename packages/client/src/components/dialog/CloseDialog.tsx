import { RefObject } from "react";
import ButtonTarget from "../buttons/target/ButtonTarget";
import styles from "./dialog.module.scss";
import { Close } from "../svgs";

export function CloseDialog({
  ref,
  responsive,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  responsive: boolean;
}) {
  return (
    <ButtonTarget
      className={
        responsive
          ? styles.closeDialog.concat(" ", styles.responsive)
          : styles.closeDialog
      }
      onClick={() => ref.current?.close()}
    >
      <Close stroke="white" width={32} height={32} />
    </ButtonTarget>
  );
}
