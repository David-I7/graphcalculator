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
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const handleSuccessEmail = (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => {
    if (data.isRegistered) {
      user.current = { password: "", lastName: "", firstName: "", email };
    } else {
      user.current = { ...user.current, email, password: "" };
    }
    setIsRegistered(data.isRegistered);
    setProgress(progress + 1);
  };

  const handlePreviousRegistered = (password: string) => {
    user.current.password = password;
    setProgress(progress - 1);
  };
  const handlePreviousUnregistered = (
    data: Pick<UserData, "firstName" | "lastName" | "password">
  ) => {
    user.current = { ...user.current, ...data };
    setProgress(progress - 1);
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
      if (isRegistered === null) return;

      if (isRegistered) {
        return (
          <AuthForm
            email={user.current.email}
            handlePreviousStep={handlePreviousRegistered}
            handleSuccess={handleSuccessAuth}
          />
        );
      }

      return (
        <RegisterForm
          credentials={{
            ...user.current,
          }}
          handlePreviousStep={handlePreviousUnregistered}
          handleSuccess={handleSuccessAuth}
        />
      );
    }
  }
}
