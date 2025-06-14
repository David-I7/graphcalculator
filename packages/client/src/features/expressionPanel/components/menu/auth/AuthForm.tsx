import React, { SetStateAction, useId, useState } from "react";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { useLazyFetch } from "../../../../../hooks/api";
import { authenticateUser } from "../../../../../lib/api/actions";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import PasswordInput from "../../../../../components/input/PasswordInput";
import { CSS_VARIABLES } from "../../../../../data/css/variables";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import { UserSessionData } from "@graphcalculator/types";

type AuthFormProps = {
  email: string;
  handleSuccess: (res: { data: { user: UserSessionData } }) => void;
  handlePreviousStep: (password: string) => void;
};

const AuthForm = ({
  email,
  handlePreviousStep,
  handleSuccess,
}: AuthFormProps) => {
  const [password, setPassword] = useState<string>("");

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <ButtonTarget className="button--hovered bg-surface">
          <ArrowLeft onClick={() => handlePreviousStep(password)} />
        </ButtonTarget>
        <h2>Welcome back!</h2>
      </div>

      <div className="auth-form-body">
        <div className="auth-form-body-content">
          <p>
            You're logging in with <strong>{email}</strong>
          </p>
          <Form
            handleSuccess={handleSuccess}
            email={email}
            password={password}
            setPassword={setPassword}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

function Form({
  email,
  password,
  setPassword,
  handleSuccess,
}: {
  email: string;
  password: string;
  setPassword: React.Dispatch<SetStateAction<string>>;
  handleSuccess: (res: { data: { user: UserSessionData } }) => void;
}) {
  const id = useId();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [trigger, { data, isLoading }] = useLazyFetch(() =>
    authenticateUser({ email, password }).then((res) => {
      if ("error" in res) return setErrorMessage(res.error.message);
      handleSuccess(res);
    })
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading) return;
        trigger();
      }}
    >
      <label htmlFor={id}>Enter your password:</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <PasswordInput
          name="password"
          autoFocus={true}
          id={id}
          minLength={8}
          value={password}
          isError={errorMessage !== undefined}
          message={errorMessage}
          onChange={(e) => {
            if (errorMessage) setErrorMessage(undefined);
            setPassword(e.target.value);
          }}
        />
        <FilledButton disabled={password.length < 8}>
          {isLoading ? (
            <div
              style={{
                display: "grid",
                placeContent: "center",
                width: "2.825rem",
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
            "Submit"
          )}
        </FilledButton>
      </div>
    </form>
  );
}
