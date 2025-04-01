import React, { RefObject, useEffect, useId, useRef, useState } from "react";
import Dialog from "../../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import Or from "../../../../../components/hr/Or";
import FormInput from "../../../../../components/input/FormInput";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../../data/css/variables";
import {
  User,
  UserData,
  VerifyEmailResponse,
} from "../../../../../state/api/types";
import { verifyEmail } from "../../../../../state/api/actions";
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
        onKeyDown={(e) => e.stopPropagation()}
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
