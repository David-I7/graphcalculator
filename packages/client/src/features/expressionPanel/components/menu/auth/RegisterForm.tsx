import React, { SetStateAction, useId, useState } from "react";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import {
  RegisterUserData,
  UserSessionData,
} from "../../../../../state/api/types";
import FormInput from "../../../../../components/input/FormInput";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { useLazyFetch } from "../../../../../hooks/api";
import { registerUser } from "../../../../../state/api/actions";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import PasswordInput from "../../../../../components/input/PasswordInput";
import { CSS_VARIABLES } from "../../../../../data/css/variables";

type RegisterFormProps = {
  credentials: RegisterUserData;
  handleSuccess: (res: { data: { user: UserSessionData } }) => void;
  handlePreviousStep: (
    data: Pick<RegisterUserData, "password" | "last_name" | "first_name">
  ) => void;
};

const RegisterForm = ({
  credentials,
  handlePreviousStep,
  handleSuccess,
}: RegisterFormProps) => {
  const [userData, setUserData] = useState<RegisterUserData>(credentials);

  return (
    <div className="register-form">
      <div className="register-form-header">
        <ButtonTarget
          className="bg-surface button--hovered"
          onClick={() =>
            handlePreviousStep({
              first_name: userData.first_name,
              last_name: userData.last_name,
              password: userData.password,
            })
          }
        >
          <ArrowLeft />
        </ButtonTarget>
        <h2>Welcome!</h2>
      </div>

      <div className="register-form-body">
        <div className="register-form-body-content">
          <p>
            You're Signing in with <strong>{userData.email}</strong>
          </p>
          <Form
            handleSuccess={handleSuccess}
            userData={userData}
            setUserData={setUserData}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

function Form({
  userData,
  setUserData,
  handleSuccess,
}: {
  userData: RegisterUserData;
  setUserData: React.Dispatch<SetStateAction<RegisterUserData>>;
  handleSuccess: (res: { data: { user: UserSessionData } }) => void;
}) {
  const firstNameId = useId();
  const lastNameId = useId();
  const passwordId = useId();
  const [trigger, { data, isLoading, isError, error }] = useLazyFetch(() =>
    registerUser(userData).then((res) => {
      if ("error" in res) throw new Error(res.error.message);
      handleSuccess(res);
    })
  );

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
        if (isLoading) return;
        trigger();
      }}
    >
      <div>
        <div>
          <label htmlFor={firstNameId}>First Name:</label>
          <FormInput
            name="firstName"
            type="text"
            required
            id={firstNameId}
            value={userData.first_name}
            onChange={(e) => {
              setUserData({ ...userData, first_name: e.target.value });
            }}
          />
        </div>
        <div>
          <label htmlFor={lastNameId}>Last Name (optional):</label>
          <FormInput
            name="lastName"
            type="text"
            id={lastNameId}
            value={userData.last_name}
            onChange={(e) => {
              setUserData({ ...userData, last_name: e.target.value });
            }}
          />
        </div>
      </div>
      <div>
        <label htmlFor={passwordId}>Password:</label>
        <PasswordInput
          name="password"
          id={passwordId}
          minLength={8}
          required
          value={userData.password}
          onChange={(e) => {
            setUserData({ ...userData, password: e.target.value });
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isError ? "space-between" : "flex-end",
          marginTop: "2rem",
        }}
      >
        {isError && (
          <div style={{ color: CSS_VARIABLES.error, fontSize: "12px" }}>
            {error?.message}
          </div>
        )}
        <FilledButton
          disabled={userData.password.length < 8 || userData.first_name === ""}
        >
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
