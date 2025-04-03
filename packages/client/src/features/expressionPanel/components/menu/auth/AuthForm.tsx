import React, { useId, useState } from "react";
import FormInput from "../../../../../components/input/FormInput";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { useLazyFetch } from "../../../../../hooks/api";
import { authenticateUser } from "../../../../../state/api/actions";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";

type AuthFormProps = {
  email: string;
  handleSuccess: () => void;
  handlePreviousStep: (password: string) => void;
};

const AuthForm = ({
  email,
  handlePreviousStep,
  handleSuccess,
}: AuthFormProps) => {
  const id = useId();
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [trigger, { data, isLoading }] = useLazyFetch(() =>
    authenticateUser({ email, password })
  );

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <ButtonTarget className="button--hovered bg-surface">
          <ArrowLeft onClick={() => handlePreviousStep(password)} />
        </ButtonTarget>
        <h2>Welcome back!</h2>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) return;
          trigger();
        }}
      >
        <label htmlFor={id}>Enter your password:</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <FormInput
            name="password"
            autoFocus={true}
            id={id}
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => {
              if (errorMessage) setErrorMessage(undefined);
              setPassword(e.target.value);
            }}
          />
          <FilledButton disabled={password.length < 8}>Submit</FilledButton>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
