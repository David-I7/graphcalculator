import React, { RefObject, useEffect, useId, useRef, useState } from "react";
import Dialog from "../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import Or from "../../../../components/hr/Or";
import FormInput from "../../../../components/input/FormInput";

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
          <h2>Log In or Sign Up</h2>

          <button>google</button>
          <button>apple</button>

          <Or />
          <AuthForm />
        </div>
      </Dialog>
    </div>
  );
};

export default AuthDialog;

function AuthForm() {
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputId = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        async function verifyEmail(email: string) {
          return await fetch("http://localhost:8080/api/register/verify", {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          })
            .then(async (res) => {
              if (!res.ok) throw await res.json();
              return await res.json();
            })
            .catch((err) => err);
        }

        verifyEmail(input).then((res) => {
          if (res.error) {
            setError(res.error.message);
          } else {
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
          {isLoading ? "Spinner" : "Next"}
        </FilledButton>
      </div>
    </form>
  );
}
