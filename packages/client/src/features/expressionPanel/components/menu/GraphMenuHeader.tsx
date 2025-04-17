import { AccountSettingsDropDown } from "./settings/AccountSettingsDropDown";
import { DialogProvider } from "../../../../components/dialog/DialogContext";
import "../../assets/auth.scss";
import AuthDialogMediator from "./auth/AuthDialogMediator";
import { UserSessionData } from "@graphcalculator/types";

const GraphMenuHeader = ({ user }: { user: UserSessionData | undefined }) => {
  return (
    <>
      {!user && (
        <header>
          <DialogProvider>
            <AuthDialogMediator />
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
