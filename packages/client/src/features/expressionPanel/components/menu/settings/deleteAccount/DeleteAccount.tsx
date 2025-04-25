import { UserSessionData } from "@graphcalculator/types";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import Dialog from "../../../../../../components/dialog/Dialog";
import {
  DialogProvider,
  useDialogContext,
} from "../../../../../../components/dialog/DialogContext";
import { isClickOutside } from "../../../../../../helpers/dom";
import { useLazyFetch } from "../../../../../../hooks/api";
import { deleteUserAccount } from "../../../../../../state/api/actions";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import VerifyEmailDialog from "../emailVerification/VerifyEmailDialog";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { useEffect } from "react";

const DeleteAccount = ({ user }: { user: UserSessionData }) => {
  if (!user.email_is_verified)
    return (
      <DialogProvider>
        <VerifyEmailDialog email={user.email} />
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
        Delete account
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
  const { setIsOpen, ref } = useDialogContext();
  const [trigger, { isLoading, isError, data, error, reset }] =
    useLazyFetch(deleteUserAccount);

  useEffect(() => {
    if (!data && !error) return;

    if (typeof data === "string") {
      window.location.reload();
    } else if (error) {
      reset();
    }
  }, [data, error]);

  return (
    <NestedDialog>
      <div className="delete-account-dialog-content">
        <h2>Are you sure you want to delete your account?</h2>
        <p>
          When you delete your account,
          <b>we will retain your data for 30 days.</b>
          You can reactivate your account at any time during those 30 days by
          logging back in. If there's something about Graph Calculator we can
          improve, please
          <a href="mailto:iosubdavid7@gmail.com"> let us know.</a>
        </p>
        <p>
          We will send you a link to your email address ({email}) so you can
          delete your account.
        </p>
      </div>
      <OutlinedButton
        onClick={() => setIsOpen(false)}
        className="bg-surface button--hovered"
      >
        Cancel
      </OutlinedButton>
      <FilledButton
        disabled={isLoading}
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
    </NestedDialog>
  );
};
