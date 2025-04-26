import { UserSessionData } from "@graphcalculator/types";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { useDialogContext } from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import FormInput from "../../../../../../components/input/FormInput";
import { useLazyFetch } from "../../../../../../hooks/api";
import { useEffect, useState } from "react";
import {
  verifyCode,
  verifyEmailAddress,
} from "../../../../../../state/api/actions";

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

export default VerifyEmailDialog;

export function VerifyEmailDialog({
  email,
}: {
  email: UserSessionData["email"];
}) {
  const { setIsOpen, isOpen } = useDialogContext();
  const [step, setStep] = useState<number>(0);
  const toggleDialog = () => setIsOpen(!isOpen);
  const handleNextStep = (step: number) => setStep(step);

  return (
    <div>
      <UnderlineButton onClick={toggleDialog} buttonType="link">
        Verify email address
      </UnderlineButton>
      <NestedDialog>
        {step === 0 && (
          <VerifyEmailConfirmation
            email={email}
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          />
        )}
        {step === 1 && <VerifyCode email={email} />}
      </NestedDialog>
    </div>
  );
}

const VerifyCode = ({ email }: { email: UserSessionData["email"] }) => {
  const [trigger, { data, error }] = useLazyFetch(() => verifyCode(code));
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    if (!data && !error) return;
  }, [data, error]);

  return (
    <div>
      <h2>We've sent an email to ({email}).</h2>
      <p>
        Type the 6 digit code from your inbox to verify your email. The Code
        expires in 5 minutes
      </p>

      <div>
        <label>Enter 6 digit code</label>
        <FormInput
          onChange={(e) => setCode(e.target.value)}
          type="number"
          min={6}
          max={6}
        />
      </div>
      <p>
        Did not receive an email?
        <UnderlineButton>Resend</UnderlineButton>
      </p>
    </div>
  );
};

function VerifyEmailConfirmation({
  step,
  handleNextStep,
  email,
  toggleDialog,
}: {
  step: number;
  handleNextStep: (step: number) => void;
  toggleDialog: () => void;
  email: string;
}) {
  const [trigger, { data, error, isLoading, reset }] =
    useLazyFetch(verifyEmailAddress);

  useEffect(() => {
    if (!data && !error) return;

    if (typeof data === "string") {
      handleNextStep(step + 1);
    } else if (data?.error) {
      // expired
    }
  }, [data, error]);

  return (
    <div>
      <h2>
        We will send a 6 digit code to {email} to verify your email address
      </h2>

      <div>
        <FilledButton
          onClick={() => {
            if (isLoading) return;
            trigger();
          }}
        >
          Send
        </FilledButton>
      </div>

      {data && typeof data != "string" && <p>{data.error.message}</p>}
    </div>
  );
}
