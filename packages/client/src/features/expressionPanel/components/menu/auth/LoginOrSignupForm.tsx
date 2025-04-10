import { useEffect, useId, useState } from "react";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { CSS_VARIABLES } from "../../../../../data/css/variables";
import FormInput from "../../../../../components/input/FormInput";
import { verifyEmail } from "../../../../../state/api/actions";
import {
  UserSessionData,
  VerifyEmailResponse,
} from "../../../../../state/api/types";
import Or from "../../../../../components/hr/Or";
import { useLazyFetch } from "../../../../../hooks/api";
import { Apple, Google } from "../../../../../components/svgs";
import { OAuth2 } from "./OAuth2";

type LoginOrSignupFormPorps = {
  previousValue: { email: string; isRegistered: boolean | null };
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
            stategies={[
              [<Google />, "Google"],
              [<Apple />, "Apple"],
            ]}
          />
          <Or style={{ marginBlock: "1rem" }} />
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
    verifyEmail(input.trim())
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
          previousValue.isRegistered !== null &&
          previousValue.email === input
        )
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
