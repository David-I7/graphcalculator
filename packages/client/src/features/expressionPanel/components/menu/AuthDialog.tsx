import React, { RefObject, useEffect, useRef, useState } from "react";
import Dialog from "../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../components/buttons/common/FilledButton";

const AuthDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <>
      <div>
        <OutlinedButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Log in
        </OutlinedButton>
        or
        <FilledButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Sign up
        </FilledButton>
      </div>
      to save your graphs!
      <Dialog
        ref={ref}
        onClose={(e) => setIsOpen(false)}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div>HELLO MY NAME IS WHAT</div>
      </Dialog>
    </>
  );
};

export default AuthDialog;
