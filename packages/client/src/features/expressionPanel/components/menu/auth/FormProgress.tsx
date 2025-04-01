import { useRef, useState } from "react";
import { UserData, VerifyEmailResponse } from "../../../../../state/api/types";
import LoginOrSignupForm from "./LoginOrSignupForm";
import AuthForm from "./AuthForm";
import RegisterForm from "./RegisterForm";

export default function FormProgress({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState<number>(0);
  const user = useRef<UserData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const handleSuccessEmail = (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => {
    user.current.email = email;
    setIsRegistered(data.isRegistered);
    setProgress(progress + 1);
  };

  const handlePreviousStep = () => {
    setProgress(progress - 1);
    setIsRegistered(false);
  };

  const handleSuccessAuth = () => {
    onComplete();
  };

  switch (progress) {
    case 0:
      return (
        <LoginOrSignupForm
          handleSuccessEmail={handleSuccessEmail}
          previousValue={{ email: user.current.email, isRegistered }}
        />
      );
    case 1: {
      if (isRegistered) {
        return (
          <AuthForm
            email={user.current.email}
            handlePreviousStep={handlePreviousStep}
            handleSuccess={handleSuccessAuth}
          />
        );
      }

      return (
        <RegisterForm
          email={user.current.email}
          handlePreviousStep={handlePreviousStep}
          handleSuccess={handleSuccessAuth}
        />
      );
    }
  }
}
