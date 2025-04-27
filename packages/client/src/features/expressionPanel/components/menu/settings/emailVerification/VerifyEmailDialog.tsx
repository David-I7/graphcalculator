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
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { useAppDispatch } from "../../../../../../state/hooks";
import apiSlice from "../../../../../../state/api/apiSlice";
import CodeInput from "../../../../../../components/input/CodeInput";
import { e } from "mathjs";
import Timeout from "../../../../../../components/Loading/Timeout/Timeout";
import { useTimeout } from "../../../../../../hooks/dom";

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
      <NestedDialog responsive={false}>
        {step === 0 && (
          <VerifyEmailConfirmation
            email={email}
            step={step}
            handleNextStep={handleNextStep}
            toggleDialog={toggleDialog}
          />
        )}
        {step === 1 && <VerifyCode />}
      </NestedDialog>
    </div>
  );
}

const VerifyCode = () => {
  const [trigger, { data, error, isLoading }] = useLazyFetch(() =>
    verifyCode(code)
  );
  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const dispatch = useAppDispatch();
  const { done, reset } = useTimeout({ duration: 60000 });
  const upsertUserSessionData = (data: { data: { user: UserSessionData } }) => {
    dispatch(
      apiSlice.util.upsertQueryData(
        "getUser",
        undefined,
        //@ts-ignore
        data
      )
    );
  };

  useEffect(() => {
    if (!data && !error) return;

    if (data && "data" in data) {
      upsertUserSessionData(data);
    } else {
      setErrorMessage(data ? data.error.message : error!.message);
    }
  }, [data, error]);

  return (
    <div className="verify-email-code">
      <h2>Check your inbox!</h2>
      <p>
        Type the 6 digit code from your inbox to verify your email. The Code
        expires in 5 minutes.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length !== 6 || isLoading) return;
          trigger();
        }}
      >
        <CodeInput
          aria-label={"Enter 6 digit code"}
          style={{
            width: "200px",
          }}
          isError={errorMessage != null}
          message={errorMessage}
          onChange={(e) => {
            if (errorMessage) setErrorMessage(undefined);
            if (e.target.value.length > 6) return;
            setCode(e.target.value);
          }}
          value={code}
          minLength={6}
          maxLength={6}
        />

        <FilledButton disabled={code.length !== 6}>
          {isLoading ? (
            <div
              style={{
                display: "grid",
                placeContent: "center",
                width: "2.825rem",
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
            "Submit"
          )}
        </FilledButton>
      </form>
      <div className="did-not-receive-email">
        <p>Did not receive an email?</p>
        <UnderlineButton
          onClick={() => {
            reset();
          }}
          disabled={!done}
        >
          Resend
        </UnderlineButton>
        {!done && (
          <Timeout
            width={18}
            height={18}
            strokeWidth={1}
            stroke="black"
            duration={60000}
          />
        )}
      </div>
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
    }
  }, [data, error]);

  return (
    <div className="verify-email-confirmation">
      <h2>
        To verify your email address, we will send a 6 digit code to{" "}
        <em>{email}</em>
      </h2>
      {data && typeof data != "string" && (
        <p style={{ marginBottom: "1rem", color: CSS_VARIABLES.error }}>
          {data.error.message}
        </p>
      )}
      <div>
        <OutlinedButton
          className="button--hovered bg-surface"
          onClick={() => {
            toggleDialog();
          }}
        >
          Cancel
        </OutlinedButton>
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
                width: "33px",
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
      </div>
    </div>
  );
}
