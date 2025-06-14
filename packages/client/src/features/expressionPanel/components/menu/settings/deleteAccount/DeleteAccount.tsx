import { UserSessionData } from "@graphcalculator/types";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import {
  DialogProvider,
  useDialogContext,
} from "../../../../../../components/dialog/DialogContext";
import { useLazyFetch } from "../../../../../../hooks/api";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { useEffect } from "react";
import { VerifyEmailBeforeDelete } from "../emailVerification/VerifyEmailDialog";
import { logoutUser } from "../../../../../../lib/api/actions";

const DeleteAccount = ({ user }: { user: UserSessionData }) => {
  if (!user.email_is_verified)
    return (
      <DialogProvider>
        <VerifyEmailBeforeDelete email={user.email} />
      </DialogProvider>
    );

  return (
    <DialogProvider>
      <DeleteAccountConfirmation email={user.email} />
    </DialogProvider>
  );
};

export default DeleteAccount;

const DeleteAccountConfirmation = ({
  email,
}: {
  email: UserSessionData["email"];
}) => {
  const { setIsOpen } = useDialogContext();

  return (
    <div className="delete-account-dialog">
      <UnderlineButton
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Delete account?
      </UnderlineButton>
      <DeleteAccountDialog email={email} />
    </div>
  );
};

const DeleteAccountDialog = ({
  email,
}: {
  email: UserSessionData["email"];
}) => {
  const { setIsOpen } = useDialogContext();
  const [trigger, { isLoading, data, error, reset }] = useLazyFetch(() =>
    logoutUser(true)
  );

  useEffect(() => {
    if (!data && !error) return;

    if (typeof data === "string") {
      window.location.reload();
    } else {
      reset();
    }
  }, [data, error]);

  return (
    <NestedDialog>
      <div className="delete-account-dialog-content">
        <div>
          <h2>Are you sure you want to delete your account?</h2>
          <p>
            When you delete your account,
            <b>we will retain your data for 30 days.</b>
            You can reactivate your account at any time during those 30 days by
            logging back in. If there's something about Graph Calculator we can
            improve, please{" "}
            <UnderlineButton
              style={{ fontSize: "1rem", height: "auto" }}
              role="link"
              buttonType="link"
            >
              <a
                style={{ textDecoration: "none", color: "inherit" }}
                href="mailto:iosubdavid7@gmail.com"
              >
                let us know.
              </a>
            </UnderlineButton>
          </p>
          <p>
            We will send you a link to your email address <span>({email})</span>{" "}
            so you can delete your account.
          </p>
        </div>

        <div>
          <OutlinedButton
            onClick={() => setIsOpen(false)}
            className="bg-surface button--hovered"
          >
            Cancel
          </OutlinedButton>
          <FilledButton
            onClick={() => {
              if (isLoading) return;
              trigger();
            }}
            buttonType="danger"
          >
            {isLoading && (
              <div className="grid-center" style={{ width: "95px" }}>
                <Spinner />
              </div>
            )}
            {!isLoading && "Delete account"}
          </FilledButton>
        </div>
      </div>
    </NestedDialog>
  );
};
