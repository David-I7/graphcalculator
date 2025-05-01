import { ReactNode, useEffect } from "react";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import { useLazyFetch } from "../../../../../../hooks/api";
import { verifyEmailAddress } from "../../../../../../lib/api/actions";

export function VerifyEmailConfirmation({
  step,
  handleNextStep,
  toggleDialog,
  children,
}: {
  children: ReactNode;
  step: number;
  handleNextStep: (step: number) => void;
  toggleDialog: () => void;
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
      {children}
      {data && typeof data != "string" && (
        <p
          className="font-body-sm"
          style={{ marginBottom: "1rem", color: CSS_VARIABLES.error }}
        >
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
