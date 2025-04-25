import { UserSessionData } from "@graphcalculator/types";
import OutlinedButton from "../../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { useDialogContext } from "../../../../../../components/dialog/DialogContext";
import { NestedDialog } from "../../../../../../components/dialog/NestedDialog";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";

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

const VerifyEmailDialogFR = ({
  email,
}: {
  email: UserSessionData["email"];
}) => {
  const { setIsOpen } = useDialogContext();

  return (
    <NestedDialog>
      <div>
        <h2>We've sent an email to ({email}).</h2>
        <p>
          Click the link recevived in your inbox to verify your account. The
          link expires in 5 minutes
        </p>
        <p>
          Did not receive an email?
          <UnderlineButton>Resend</UnderlineButton>
        </p>
      </div>
    </NestedDialog>
  );
};
