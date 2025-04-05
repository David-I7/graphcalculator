import { useId, useState } from "react";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import { RegisterUserData } from "../../../../../state/api/types";
import FormInput from "../../../../../components/input/FormInput";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { useLazyFetch } from "../../../../../hooks/api";
import { registerUser } from "../../../../../state/api/actions";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import PasswordInput from "../../../../../components/input/PasswordInput";

type RegisterFormProps = {
  credentials: RegisterUserData;
  handleSuccess: () => void;
  handlePreviousStep: (
    data: Pick<RegisterUserData, "password" | "lastName" | "firstName">
  ) => void;
};

const RegisterForm = ({
  credentials,
  handlePreviousStep,
}: RegisterFormProps) => {
  const [userData, setUserData] = useState<RegisterUserData>(credentials);
  const firstNameId = useId();
  const lastNameId = useId();
  const passwordId = useId();
  const [trigger, { data, isLoading }] = useLazyFetch(() =>
    registerUser(userData)
  );

  return (
    <div className="register-form">
      <div className="register-form-header">
        <ButtonTarget
          className="bg-surface button--hovered"
          onClick={() =>
            handlePreviousStep({
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: userData.password,
            })
          }
        >
          <ArrowLeft />
        </ButtonTarget>
        <h2>Welcome</h2>
      </div>

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
              value={userData.firstName}
              onChange={(e) => {
                setUserData({ ...userData, firstName: e.target.value });
              }}
            />
          </div>
          <div>
            <label htmlFor={lastNameId}>Last Name (optional):</label>
            <FormInput
              name="lastName"
              type="text"
              id={lastNameId}
              value={userData.lastName}
              onChange={(e) => {
                setUserData({ ...userData, lastName: e.target.value });
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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <FilledButton
            disabled={userData.password.length < 8 || userData.firstName === ""}
          >
            {isLoading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              "Submit"
            )}
          </FilledButton>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
