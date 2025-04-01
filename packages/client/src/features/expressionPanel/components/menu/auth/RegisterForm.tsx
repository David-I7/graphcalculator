import { useId, useState } from "react";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import { UserData } from "../../../../../state/api/types";
import FormInput from "../../../../../components/input/FormInput";
import FilledButton from "../../../../../components/buttons/common/FilledButton";

type RegisterFormProps = {
  credentials: UserData;
  handleSuccess: () => void;
  handlePreviousStep: (
    data: Pick<UserData, "password" | "lastName" | "firstName">
  ) => void;
};

const RegisterForm = ({
  credentials,
  handlePreviousStep,
}: RegisterFormProps) => {
  const [userData, setUserData] = useState<UserData>(credentials);
  const firstNameId = useId();
  const lastNameId = useId();
  const passwordId = useId();

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

      <form>
        <div>
          <div>
            <label htmlFor={firstNameId}>First Name:</label>
            <FormInput
              type="text"
              required
              value={userData.firstName}
              onChange={(e) => {
                setUserData({ ...userData, firstName: e.target.value });
              }}
            />
          </div>
          <div>
            <label htmlFor={lastNameId}>Last Name (optional):</label>
            <FormInput
              type="text"
              value={userData.lastName}
              onChange={(e) => {
                setUserData({ ...userData, lastName: e.target.value });
              }}
            />
          </div>
        </div>
        <div>
          <label htmlFor={passwordId}>Password:</label>
          <FormInput
            type="password"
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
            Submit
          </FilledButton>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
