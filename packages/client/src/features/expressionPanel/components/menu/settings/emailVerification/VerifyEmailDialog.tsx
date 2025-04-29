import { UserSessionData } from "@graphcalculator/types";
import { useDialogContext } from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import { VerifyCode } from "./VerifyCode";
import { VerifyEmailConfirmation } from "./VerifyEmailConfirmation";
import { useState } from "react";

export function VerifyEmailBeforeDelete({
  email,
}: {
  email: UserSessionData["email"];
}) {
  const { setIsOpen, isOpen } = useDialogContext();
  const [step, setStep] = useState<number>(0);
  const toggleDialog = () => setIsOpen(!isOpen);
  const handleNextStep = (step: number) => setStep(step);

  return (
    <div className="verify-email-before-delete-dialog">
      <UnderlineButton onClick={toggleDialog}>Delete account?</UnderlineButton>
      <NestedDialog responsive={false}>
        {step === 0 && (
          <VerifyEmailConfirmation
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          >
            <h2>
              To delete your account, we first need to verify your email address
              by sending a 6 digit code to <em>{email}</em>
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

function VerifyEmailDialog({ email }: { email: UserSessionData["email"] }) {
  const { setIsOpen, isOpen } = useDialogContext();
  const [step, setStep] = useState<number>(0);
  const toggleDialog = () => setIsOpen(!isOpen);
  const handleNextStep = (step: number) => setStep(step);

  return (
    <div>
      <UnderlineButton onClick={toggleDialog} buttonType="link">
        Verify email address
      </UnderlineButton>
      <NestedDialog responsive={false}>
        {step === 0 && (
          <VerifyEmailConfirmation
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          >
            <h2>
              To verify your email address, we will send a 6 digit code to{" "}
              <em>{email}</em>
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

export default VerifyEmailDialog;
