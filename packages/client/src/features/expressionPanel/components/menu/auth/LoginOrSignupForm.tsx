import React, { useEffect, useId, useState } from "react";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { CSS_VARIABLES } from "../../../../../data/css/variables";
import FormInput from "../../../../../components/input/FormInput";
import { verifyEmail } from "../../../../../state/api/actions";
import { VerifyEmailResponse } from "../../../../../state/api/types";
import Or from "../../../../../components/hr/Or";
import { useLazyFetch } from "../../../../../hooks/api";

type LoginOrSignupFormPorps = {
  previousValue: { email: string; isRegistered: boolean };
  handleSuccessEmail: (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => void;
};

const LoginOrSignupForm = (props: LoginOrSignupFormPorps) => {
  return (
    <div className="email-form">
      <div className="email-form-header">
        <h2>Log In or Sign Up</h2>
      </div>

      <button>google</button>
      <button>apple</button>

      <Or />
      <VerifyEmailForm {...props} />
    </div>
  );
};

function VerifyEmailForm({
  handleSuccessEmail,
  previousValue,
}: LoginOrSignupFormPorps) {
  const [input, setInput] = useState<string>(previousValue.email);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const inputId = useId();
  const [trigger, { data, isLoading }] = useLazyFetch(() =>
    verifyEmail(input.trim())
  );

  useEffect(() => {
    if (data === null) return;

    if ("error" in data) setErrorMessage(data.error.message);
    else handleSuccessEmail(input, data.data);
  }, [data]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading) return;
        if (input !== "" && previousValue.email === input)
          return handleSuccessEmail(input, {
            isRegistered: previousValue.isRegistered,
          });

        trigger();
      }}
    >
      <label htmlFor={inputId}>Continue with email:</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <FormInput
          autoFocus={true}
          isError={errorMessage !== undefined}
          message={errorMessage}
          id={inputId}
          type="email"
          value={input}
          onChange={(e) => {
            if (errorMessage) setErrorMessage(undefined);
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

export default LoginOrSignupForm;
