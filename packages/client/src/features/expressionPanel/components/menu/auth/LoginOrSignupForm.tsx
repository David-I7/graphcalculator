import { useEffect, useId, useState } from "react";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { CSS_VARIABLES } from "../../../../../data/css/variables";
import FormInput from "../../../../../components/input/FormInput";
import { verifyIsRegistered } from "../../../../../lib/api/actions";
import { VerifyEmailResponse } from "../../../../../lib/api/types";
import Or from "../../../../../components/hr/Or";
import { useLazyFetch } from "../../../../../hooks/api";

import { OAuth2 } from "./OAuth2";
import { UserSessionData } from "@graphcalculator/types";
import oauthStrategies from "../../../../../data/oauthStrategies";

type LoginOrSignupFormPorps = {
  previousValue: { email: string; data: VerifyEmailResponse["data"] | null };
  onComplete: (res: { data: { user: UserSessionData } }) => void;
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

      <div className="email-form-body">
        <div className="email-form-body-content">
          <OAuth2
            onComplete={props.onComplete}
            stategies={Object.values(oauthStrategies)}
          />
          <Or style={{ marginBlock: "1.5rem" }} />
          <VerifyEmailForm {...props} />
        </div>
      </div>
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
    verifyIsRegistered(input.trim())
  );

  useEffect(() => {
    if (data === null) return;

    if ("error" in data) setErrorMessage(data.error.message);
    else handleSuccessEmail(input, data.data);
  }, [data]);

  return (
    <form
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) return;
        if (
          input !== "" &&
          previousValue.data !== null &&
          previousValue.email === input
        )
          return handleSuccessEmail(previousValue.email, previousValue.data);

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
