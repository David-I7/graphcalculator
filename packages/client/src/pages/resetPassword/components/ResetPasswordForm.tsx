import { useId, useState } from "react";
import { useLazyFetch } from "../../../hooks/api";
import PasswordInput from "../../../components/input/PasswordInput";
import { CSS_VARIABLES } from "../../../data/css/variables";
import FilledButton from "../../../components/buttons/common/FilledButton";
import Spinner from "../../../components/Loading/Spinner/Spinner";
import { resetPassword } from "../../../lib/api/actions";
import { useSearchParams } from "../../../hooks/dom";

export default ResetPasswordForm;

function ResetPasswordForm() {
  const { resetToken } = useSearchParams(["resetToken"]);
  const [trigger, { isLoading, data, error, reset }] = useLazyFetch(() =>
    resetPassword(password, resetToken as string)
  );
  const isError = (data && typeof data !== "string") || error;
  const isSuccess = data && typeof data === "string" ? true : false;

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const passwordId = useId();
  const confirmPasswordId = useId();

  return (
    <form
      className="reset-password-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !(password.length >= 8) ||
          password !== confirmPassword ||
          isSuccess
        )
          return;
        if (isLoading) return;
        trigger();
      }}
    >
      <div>
        <div>
          <label htmlFor={passwordId}>New password</label>
          <PasswordInput
            id={passwordId}
            value={password}
            onChange={(e) => {
              if (error) reset();
              setPassword(e.target.value);
            }}
          />
        </div>
        <div>
          <label htmlFor={confirmPasswordId}>Confirm password</label>
          <PasswordInput
            id={confirmPasswordId}
            value={confirmPassword}
            onChange={(e) => {
              if (error) reset();
              setConfirmPassword(e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        {isError && (
          <div className="font-body-sm" style={{ color: CSS_VARIABLES.error }}>
            {data && typeof data !== "string"
              ? data.error.message
              : error!.message}
          </div>
        )}
        {isSuccess && (
          <div
            className="font-body-sm"
            style={{ color: CSS_VARIABLES.success }}
          >
            Password successfully changed
          </div>
        )}

        <FilledButton
          disabled={
            !(password.length >= 8) || password !== confirmPassword || isSuccess
          }
        >
          {isLoading ? (
            <div
              style={{
                display: "grid",
                placeContent: "center",
                width: "31px",
              }}
            >
              <Spinner
                style={{
                  borderColor: CSS_VARIABLES.onPrimary,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : isSuccess ? (
            "Saved"
          ) : (
            "Save"
          )}
        </FilledButton>
      </div>
    </form>
  );
}
