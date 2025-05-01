import { useEffect, useState } from "react";
import { useLazyFetch } from "../../../../../../hooks/api";
import {
  verifyCode,
  verifyEmailAddress,
} from "../../../../../../lib/api/actions";
import { UserSessionData } from "@graphcalculator/types";
import { useTimeout } from "../../../../../../hooks/dom";
import { useAppDispatch } from "../../../../../../state/hooks";
import apiSlice from "../../../../../../state/api/apiSlice";
import CodeInput from "../../../../../../components/input/CodeInput";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import Timeout from "../../../../../../components/Loading/Timeout/TimeoutLoader";
import TimeoutLiteral from "../../../../../../components/Loading/Timeout/TimeoutLiteral";

export const VerifyCode = ({
  step,
  handleNextStep,
  toggleDialog,
}: {
  step: number;
  handleNextStep: (step: number) => void;
  toggleDialog: () => void;
}) => {
  const codeDuration = 60000 * 5;
  const [cancelled, setCancelled] = useState<boolean>(false);
  const {
    done,
    reset: resetTimeout,
    removeTimeout,
  } = useTimeout({
    duration: codeDuration,
    onComplete: () => {
      toggleDialog();
      handleNextStep(step - 1);
    },
  });
  const notifyParent = (success: boolean) => {
    setCancelled(!success);
    if (success) {
      resetTimeout();
    } else {
      removeTimeout();
    }
  };

  return (
    <div className="verify-email-code">
      <h2>Check your inbox!</h2>
      <p>
        Type the 6 digit code from your inbox to verify your email. The Code
        expires in{" "}
        <TimeoutLiteral
          style={{ color: CSS_VARIABLES.onSurfaceHeading, fontWeight: 500 }}
          fastForward={cancelled}
          duration={codeDuration}
        />
      </p>
      <SubmitCodeForm
        toggleDialog={toggleDialog}
        handleNextStep={handleNextStep}
        step={step}
      />
      <DidNotReceiveEmail notifyParent={notifyParent} />
    </div>
  );
};

function SubmitCodeForm({
  toggleDialog,
  step,
  handleNextStep,
}: {
  toggleDialog: () => void;
  step: number;
  handleNextStep: (step: number) => void;
}) {
  const [trigger, { data, error, isLoading }] = useLazyFetch(() =>
    verifyCode(code)
  );
  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const dispatch = useAppDispatch();
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
      toggleDialog();
      return;
    } else {
      if (data && data.error.message[data.error.message.length - 1] === "0") {
        toggleDialog();
        handleNextStep(step - 1);
        return;
      }

      setErrorMessage(data ? data.error.message : error!.message);
    }
  }, [data, error]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length !== 6 || isLoading) return;
        trigger();
      }}
    >
      <CodeInput
        autoFocus
        aria-label={"Enter 6 digit code"}
        style={{
          width: "212px",
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

      <FilledButton disabled={code.length !== 6 || isLoading}>
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
  );
}

function DidNotReceiveEmail({
  notifyParent,
}: {
  notifyParent: (success: boolean) => void;
}) {
  const durationMS = 60000;
  const { done, reset, removeTimeout } = useTimeout({ duration: durationMS });
  const [triggerResend, { data, error, isLoading, reset: resetResend }] =
    useLazyFetch(verifyEmailAddress);

  useEffect(() => {
    if (!data && !error) return;

    const timeout = setTimeout(() => {
      resetResend();
      if (typeof data === "string") {
        reset();
        notifyParent(true);
      } else {
        notifyParent(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [data, error]);

  const isError = (data && typeof data !== "string") || error;
  const isSuccess = data && typeof data == "string" ? true : false;

  return (
    <div className="did-not-receive-email">
      <p>Did not receive an email?</p>
      {!isSuccess && !isError && !isLoading && (
        <UnderlineButton
          onClick={() => {
            if (isLoading) return;
            triggerResend();
            removeTimeout();
          }}
          disabled={!done}
        >
          Resend
        </UnderlineButton>
      )}
      {(isError || isLoading || isSuccess) && (
        <div
          className="grid-center font-body-sm"
          style={{ height: "2rem", color: CSS_VARIABLES.onSurfaceHeading }}
        >
          {isLoading && "Resending..."}
          {isError && (
            <div style={{ color: CSS_VARIABLES.error }}>
              {typeof data !== "string" ? data!.error.message : error!.message}
            </div>
          )}
          {isSuccess && "Sent"}
        </div>
      )}
      {!done && <Timeout duration={durationMS} />}
    </div>
  );
}
