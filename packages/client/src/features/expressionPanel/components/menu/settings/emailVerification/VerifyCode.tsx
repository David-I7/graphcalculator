import { useEffect, useState } from "react";
import { FetchState, Trigger, useLazyFetch } from "../../../../../../hooks/api";
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
import { ApiErrorResponse } from "../../../../../../lib/api/types";

type VerifyCodeProps = {
  step: number;
  handleNextStep: (step: number) => void;
  toggleDialog: () => void;
};

export const VerifyCode = (props: VerifyCodeProps) => {
  const [triggerResend, state] = useLazyFetch(verifyEmailAddress);
  const isError =
    (state.data && typeof state.data !== "string") || state.error != null;
  const isSuccess = state.data && typeof state.data == "string" ? true : false;

  return (
    <div className="verify-email-code">
      <h2>Check your inbox!</h2>
      <CodeTimeout
        isResending={state.isLoading}
        isSuccess={isSuccess}
        {...props}
      />
      <SubmitCodeForm isResending={state.isLoading} {...props} />
      <DidNotReceiveEmail
        triggerResend={triggerResend}
        fetchState={state}
        isError={isError}
        isSuccess={isSuccess}
      />
    </div>
  );
};

function CodeTimeout({
  toggleDialog,
  step,
  handleNextStep,
  isResending,
  isSuccess,
}: VerifyCodeProps & { isResending: boolean; isSuccess: boolean }) {
  const codeDuration = 60000 * 5;
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

  useEffect(() => {
    if (isResending) {
      removeTimeout();
    }
    if (isSuccess) {
      resetTimeout();
    }
  }, [isResending, isSuccess]);

  return (
    <p>
      Type the 6 digit code from your inbox to verify your email. The Code
      expires in{" "}
      <TimeoutLiteral
        style={{ color: CSS_VARIABLES.onSurfaceHeading, fontWeight: 500 }}
        fastForward={done}
        duration={codeDuration}
      />
    </p>
  );
}

function SubmitCodeForm({
  toggleDialog,
  step,
  handleNextStep,
  isResending,
}: VerifyCodeProps & { isResending: boolean }) {
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
    if (isResending) {
      setCode("");
      setErrorMessage(undefined);
    }
  }, [isResending]);

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
  triggerResend,
  fetchState: { data, error, isLoading, reset: resentResend },
  isSuccess,
  isError,
}: {
  triggerResend: Trigger;
  fetchState: FetchState<string | ApiErrorResponse> & {
    reset: () => void;
  };
  isSuccess: boolean;
  isError: boolean;
}) {
  const durationMS = 60000;
  const { done, reset, removeTimeout } = useTimeout({ duration: durationMS });

  useEffect(() => {
    if (!data && !error) return;

    const timeout = setTimeout(() => {
      resentResend();
      if (typeof data === "string") {
        reset();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [data, error]);

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
          {isLoading && <span>Resending...</span>}
          {isError && (
            <span style={{ color: CSS_VARIABLES.error }}>
              {typeof data !== "string" ? data!.error.message : error!.message}
            </span>
          )}
          {isSuccess && <span>Sent</span>}
        </div>
      )}
      {!done && <Timeout duration={durationMS} />}
    </div>
  );
}
