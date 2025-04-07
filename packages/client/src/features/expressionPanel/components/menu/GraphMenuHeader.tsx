import { UserSessionData } from "../../../../state/api/types";
import AuthDialog from "./auth/AuthDialog";
import { AccountSettingsDropDown } from "./settings/AccountSettingsDropDown";
import { DialogProvider } from "../../../../components/dialog/DialogContext";

const GraphMenuHeader = ({ user }: { user: UserSessionData | undefined }) => {
  return (
    <>
      {!user && (
        <header>
          <DialogProvider>
            <AuthDialog />
          </DialogProvider>
        </header>
      )}
      {user && (
        <header>
          <AccountSettingsDropDown user={user} />
          {/* Logout controls; Search controls */}
        </header>
      )}
    </>
  );
};

export default GraphMenuHeader;
