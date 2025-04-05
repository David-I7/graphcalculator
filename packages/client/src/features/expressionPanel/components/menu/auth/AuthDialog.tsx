import { useEffect, useRef, useState } from "react";
import Dialog from "../../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import FormProgress from "./FormProgress";
import { useAppDispatch } from "../../../../../state/hooks";
import { UserSessionData } from "../../../../../state/api/types";
import apiSlice from "../../../../../state/api/apiSlice";

const AuthDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const dispatch = useAppDispatch();
  const onComplete = (user: UserSessionData) => {
    setIsOpen(!isOpen);
    dispatch(apiSlice.util.upsertQueryData("getUser", undefined, user));
  };

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
          e.stopPropagation();
        }}
      >
        {isOpen && (
          <div className="auth-dialog-content">
            <FormProgress onComplete={onComplete} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AuthDialog;
