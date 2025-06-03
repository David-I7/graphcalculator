import { useRef, useState } from "react";
import {
  RegisterUserData,
  VerifyEmailResponse,
} from "../../../../../lib/api/types";
import LoginOrSignupForm from "./LoginOrSignupForm";
import AuthForm from "./AuthForm";
import RegisterForm from "./RegisterForm";
import { Provider, UserSessionData } from "@graphcalculator/types";
import { AuthWithProvider } from "./AuthWithProvider";

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
  const [verifyEmailResponse, setVerifyEmailResponse] = useState<
    VerifyEmailResponse["data"] | null
  >(null);

  const handleSuccessEmail = (
    email: string,
    data: VerifyEmailResponse["data"]
  ) => {
    if (data.isRegistered) {
      user.current = { password: "", last_name: "", first_name: "", email };
    } else {
      user.current = { ...user.current, email, password: "" };
    }
    setVerifyEmailResponse(data);
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
          previousValue={{
            email: user.current.email,
            data: verifyEmailResponse,
          }}
        />
      );
    case 1: {
      if (verifyEmailResponse === null) return;

      if (verifyEmailResponse.isRegistered) {
        if (
          !verifyEmailResponse.provider ||
          //@ts-ignore
          verifyEmailResponse.provider === Provider.graphCalculator
        )
          return (
            <AuthForm
              email={user.current.email}
              handlePreviousStep={handlePreviousRegistered}
              handleSuccess={onComplete}
            />
          );
        else
          return (
            <AuthWithProvider
              email={user.current.email}
              handlePreviousStep={() => setProgress(progress - 1)}
              onComplete={onComplete}
              provider={verifyEmailResponse.provider}
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
