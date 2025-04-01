import { useId, useState } from "react";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import { UserData } from "../../../../../state/api/types";
import FormInput from "../../../../../components/input/FormInput";
import FilledButton from "../../../../../components/buttons/common/FilledButton";

type RegisterFormProps = {
  email: string;
  handleSuccess: () => void;
  handlePreviousStep: () => void;
};

const RegisterForm = ({ email, handlePreviousStep }: RegisterFormProps) => {
  const [userData, setUserData] = useState<UserData>({
    email,
    firstName: "",
    lastName: "",
    password: "",
  });
  const firstNameId = useId();
  const lastNameId = useId();
  const passwordId = useId();

  return (
    <div className="register-form">
      <div className="register-form-header">
        <ButtonTarget
          className="bg-surface button--hovered"
          onClick={handlePreviousStep}
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
            disabled={userData.password === "" || userData.firstName === ""}
          >
            Submit
          </FilledButton>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
