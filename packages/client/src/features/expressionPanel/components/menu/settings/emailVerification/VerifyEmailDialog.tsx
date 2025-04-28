import { UserSessionData } from "@graphcalculator/types";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { useDialogContext } from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import { VerifyCode } from "./VerifyCode";
import { VerifyEmailConfirmation } from "./VerifyEmailConfirmation";
import { useState } from "react";

const VerifyEmailDialogL = ({ email }: { email: UserSessionData["email"] }) => {
  const { setIsOpen } = useDialogContext();

  return (
    <NestedDialog>
      <div>
        <h2>
          In order to delete your account we need to verify your email address
          first ({email}).
        </h2>
        <OutlinedButton
          onClick={() => setIsOpen(false)}
          className="button--hovered bg-surface"
        >
          Cancel
        </OutlinedButton>
        <FilledButton>Send confirmation link</FilledButton>
      </div>
    </NestedDialog>
  );
};

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
            email={email}
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          />
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
