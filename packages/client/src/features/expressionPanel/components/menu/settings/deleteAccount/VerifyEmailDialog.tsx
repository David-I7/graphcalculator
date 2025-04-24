import { UserSessionData } from "@graphcalculator/types";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { useDialogContext } from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";

const VerifyEmailDialog = ({ email }: { email: UserSessionData["email"] }) => {
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
