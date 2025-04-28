import { useEffect, useState } from "react";
import { useLazyFetch } from "../../../../../../hooks/api";
import {
  verifyCode,
  verifyEmailAddress,
} from "../../../../../../state/api/actions";
import { UserSessionData } from "@graphcalculator/types";
import { useTimeout } from "../../../../../../hooks/dom";
import { useAppDispatch } from "../../../../../../state/hooks";
import apiSlice from "../../../../../../state/api/apiSlice";
import CodeInput from "../../../../../../components/input/CodeInput";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import Timeout from "../../../../../../components/Loading/Timeout/Timeout";

export const VerifyCode = ({
  step,
  handleNextStep,
  toggleDialog,
}: {
  step: number;
  handleNextStep: (step: number) => void;
  toggleDialog: () => void;
}) => {
  const [trigger, { data, error, isLoading }] = useLazyFetch(() =>
    verifyCode(code)
  );
  const [code, setCode] = useState<string>("");
  const [attempts, setattempts] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const notifyParent = (success: boolean) => {
    setCode("");
    setattempts(0);
    setIsDisabled(!success);
  };
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
      setErrorMessage(data ? data.error.message : error!.message);
    }

    if (attempts === 5 && !isLoading) {
      toggleDialog();
      handleNextStep(step - 1);
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
          if (code.length !== 6 || isLoading || isDisabled) return;
          trigger();
          setattempts((prev) => prev + 1);
        }}
      >
        <CodeInput
          autoFocus
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

        <FilledButton disabled={code.length !== 6 || isLoading || isDisabled}>
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
      <DidNotReceiveEmail notifyParent={notifyParent} />
    </div>
  );
};

function DidNotReceiveEmail({
  notifyParent,
}: {
  notifyParent: (success: boolean) => void;
}) {
  const durationMS = 60000;
  const { done, reset, removeTimeout } = useTimeout({ duration: durationMS });
  const [triggerResend, { data, error, isLoading, reset: resetRend }] =
    useLazyFetch(verifyEmailAddress);

  useEffect(() => {
    if (!data && !error) return;

    const timeout = setTimeout(() => {
      resetRend();
      if (typeof data === "string") {
        reset();
        notifyParent(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [data, error]);

  const isError = (data && typeof data !== "string") || error;

  return (
    <div className="did-not-receive-email">
      <p>Did not receive an email?</p>
      {!data && !isError && !isLoading && (
        <UnderlineButton
          onClick={() => {
            if (isLoading) return;
            triggerResend();
            notifyParent(false);
            removeTimeout();
          }}
          disabled={!done}
        >
          Resend
        </UnderlineButton>
      )}
      {(isError || isLoading || data !== null) && (
        <div
          className="grid-center font-body-sm"
          style={{ height: "2rem", color: CSS_VARIABLES.onSurfaceHeading }}
        >
          {isLoading && "Resending..."}
          {data && typeof data !== "string" && (
            <div style={{ color: CSS_VARIABLES.error }}>
              {data!.error.message}
            </div>
          )}
          {error && (
            <div style={{ color: CSS_VARIABLES.error }}>{error.message}</div>
          )}
          {data && typeof data === "string" && "Sent"}
        </div>
      )}
      {!done && <Timeout duration={durationMS} />}
    </div>
  );
}
