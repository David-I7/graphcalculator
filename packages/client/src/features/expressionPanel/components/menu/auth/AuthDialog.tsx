import { useEffect, useRef, useState } from "react";
import Dialog from "../../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import FormProgress from "./FormProgress";

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
    <div className="auth-dialog">
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
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
          e.stopPropagation();
        }}
      >
        {isOpen && (
          <div className="auth-dialog-content">
            <FormProgress onComplete={() => setIsOpen(false)} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AuthDialog;
