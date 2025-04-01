import React, { RefObject, useEffect, useId, useRef, useState } from "react";
import Dialog from "../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import Or from "../../../../components/hr/Or";
import FormInput from "../../../../components/input/FormInput";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import {
  User,
  UserData,
  VerifyEmailResponse,
} from "../../../../state/api/types";
import { verifyEmail } from "../../../../state/api/actions";

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
        <div className="auth-dialog-content">
          <FormProgress onComplete={() => setIsOpen(false)} />
        </div>
      </Dialog>
    </div>
  );
};

export default AuthDialog;

function FormProgress({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState<number>(0);
  const user = useRef<UserData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const handleSuccessEmail = (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => {
    user.current.email = email;
    setIsRegistered(data.isRegistered);
    setProgress(progress + 1);
  };

  const handlePreviousStep = () => {
    setProgress(progress - 1);
    setIsRegistered(false);
  };

  const handleSuccessAuth = () => {
    onComplete();
  };

  switch (progress) {
    case 0:
      return (
        <>
          <h2>Log In or Sign Up</h2>

          <button>google</button>
          <button>apple</button>

          <Or />
          <VerifyEmailForm
            initialValue={user.current.email}
            handleSuccessEmail={handleSuccessEmail}
          />
        </>
      );
    case 1: {
      if (isRegistered) {
        return <></>;
      }

      return <></>;
    }
  }
}

function VerifyEmailForm({
  handleSuccessEmail,
  initialValue,
}: {
  initialValue: string;
  handleSuccessEmail: (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => void;
}) {
  const [input, setInput] = useState<string>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputId = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading) return;

        const trimmedEmail = input.trim();

        verifyEmail(trimmedEmail).then((res) => {
          if ("error" in res) {
            setError(res.error.message);
          } else {
            handleSuccessEmail(trimmedEmail, res.data);
          }

          setIsLoading(false);
        });

        setIsLoading(true);
      }}
    >
      <label htmlFor={inputId}>Continue with email:</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <FormInput
          isError={error !== undefined}
          message={error}
          id={inputId}
          type="email"
          value={input}
          onChange={(e) => {
            if (error) setError(undefined);
            setInput(e.target.value);
          }}
        />
        <FilledButton disabled={input === ""}>
          {isLoading ? (
            <div
              style={{
                width: "1.875rem",
                display: "grid",
                placeContent: "center",
              }}
            >
              <Spinner
                style={{
                  borderColor: CSS_VARIABLES.onPrimary,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            "Next"
          )}
        </FilledButton>
      </div>
    </form>
  );
}

function AuthForm({}: { handlePreviousStep: () => void }) {}

function RegisterForm({}: { handlePreviousStep: () => void }) {}
