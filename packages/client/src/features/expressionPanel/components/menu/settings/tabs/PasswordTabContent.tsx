import { UserSessionData } from "@graphcalculator/types";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import {
  DialogProvider,
  useDialogContext,
} from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import { VerifyCode } from "../emailVerification/VerifyCode";
import { VerifyEmailConfirmation } from "../emailVerification/VerifyEmailConfirmation";
import { useState } from "react";
import { useLazyFetch } from "../../../../../../hooks/api";
import { requestResetPassword } from "../../../../../../lib/api/actions";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";

export function PasswordTabContent({ user }: { user: UserSessionData }) {
  return (
    <div className="password-tab">
      <p>
        We will send a link to your email address <b>({user.email})</b> so that
        you can reset your password.
      </p>
      <div>
        {!user.email_is_verified && (
          <DialogProvider>
            <VerifyEmailBeforePasswordReset email={user.email} />
          </DialogProvider>
        )}
        {user.email_is_verified && <SendResetPasswordLink />}
      </div>
    </div>
  );
}

function VerifyEmailBeforePasswordReset({
  email,
}: {
  email: UserSessionData["email"];
}) {
  const { setIsOpen, isOpen } = useDialogContext();
  const [step, setStep] = useState<number>(0);
  const toggleDialog = () => setIsOpen(!isOpen);
  const handleNextStep = (step: number) => setStep(step);

  return (
    <div className="verify-email-before-pasword-reset-dialog">
      <FilledButton onClick={toggleDialog}>Send</FilledButton>
      <NestedDialog responsive={false}>
        {step === 0 && (
          <VerifyEmailConfirmation
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          >
            <h2>
              To change your password, we first need to verify your email
              address by sending a 6 digit code to <em>{email}</em>
            </h2>
          </VerifyEmailConfirmation>
        )}
        {step === 1 && (
          <VerifyCode
            step={step}
            toggleDialog={toggleDialog}
            handleNextStep={handleNextStep}
          />
        )}
      </NestedDialog>
    </div>
  );
}

function SendResetPasswordLink() {
  const [trigger, { data, isLoading, error }] =
    useLazyFetch(requestResetPassword);

  const isError = (data && typeof data !== "string") || error;

  return (
    <>
      {isError && (
        <p style={{ color: CSS_VARIABLES.error }}>
          {typeof data !== "string" ? data!.error.message : error!.message}
        </p>
      )}
      <FilledButton
        onClick={() => {
          if (isLoading) return;
          trigger();
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "grid",
              placeContent: "center",
              width: "32px",
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
          "Send"
        )}
      </FilledButton>
    </>
  );
}
