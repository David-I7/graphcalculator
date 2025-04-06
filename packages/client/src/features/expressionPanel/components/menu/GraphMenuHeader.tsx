import { UserSessionData } from "../../../../state/api/types";
import AuthDialog from "./auth/AuthDialog";
import { AccountSettingsDropDown } from "./AccountSettingsDropDown";

const GraphMenuHeader = ({ user }: { user: UserSessionData | undefined }) => {
  return (
    <>
      {!user && (
        <header>
          <AuthDialog />
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
