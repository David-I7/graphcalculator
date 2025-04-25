import { useRef, useState } from "react";
import {
  RegisterUserData,
  VerifyEmailResponse,
} from "../../../../../state/api/types";
import LoginOrSignupForm from "./LoginOrSignupForm";
import AuthForm from "./AuthForm";
import RegisterForm from "./RegisterForm";
import { UserSessionData } from "@graphcalculator/types";

export default function FormProgress({
  onComplete,
}: {
  onComplete: (res: { data: { user: UserSessionData } }) => void;
}) {
  const [progress, setProgress] = useState<number>(0);
  const user = useRef<RegisterUserData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const handleSuccessEmail = (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => {
    if (data.isRegistered) {
      user.current = { password: "", last_name: "", first_name: "", email };
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
    data: Pick<RegisterUserData, "first_name" | "last_name" | "password">
  ) => {
    user.current = { ...user.current, ...data };
    setProgress(progress - 1);
  };

  switch (progress) {
    case 0:
      return (
        <LoginOrSignupForm
          onComplete={onComplete}
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
            handleSuccess={onComplete}
          />
        );
      }

      return (
        <RegisterForm
          credentials={{
            ...user.current,
          }}
          handlePreviousStep={handlePreviousUnregistered}
          handleSuccess={onComplete}
        />
      );
    }
  }
}
