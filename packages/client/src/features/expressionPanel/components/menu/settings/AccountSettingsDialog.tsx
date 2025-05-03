import {
  Provider,
  UserRolesEnum,
  UserSessionData,
} from "@graphcalculator/types";
import UnderlineButton from "../../../../../components/buttons/common/UnderlineButton";
import Dialog from "../../../../../components/dialog/Dialog";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";
import Tabs from "../../../../../components/tabs/Tabs";
import { Tab } from "../../../../../components/tabs/Tab";
import { ProfileTabContent } from "./tabs/ProfileTabContent";
import { PasswordTabContent } from "./tabs/PasswordTabContent";
import { AdminTabContent } from "./tabs/AdminTabContent";
import "../../../assets/tabs.scss";

export function AccountSettingsDialog({ user }: { user: UserSessionData }) {
  const { isOpen, setIsOpen } = useDialogContext();
  const closeDialog = () => setIsOpen(false);

  return (
    <div className="account-settings-dialog-opener">
      <UnderlineButton
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        Account settings
      </UnderlineButton>
      <Dialog
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        {isOpen && <DialogContent closeDialog={closeDialog} user={user} />}
      </Dialog>
    </div>
  );
}

function DialogContent({
  closeDialog,
  user,
}: {
  closeDialog: () => void;
  user: UserSessionData;
}) {
  return (
    <div className="account-settings-dialog">
      <div className="account-settings-dialog-header">
        <h2>Account Settings</h2>
      </div>
      <div className="account-settings-dialog-body">
        <Tabs>
          <Tab
            content={
              <ProfileTabContent closeDialog={closeDialog} user={user} />
            }
            label="Profile"
          />
          {user.provider === Provider.graphCalculator ? (
            <Tab
              content={<PasswordTabContent user={user} />}
              label="Password"
            />
          ) : null}
          {user.role === UserRolesEnum.ADMIN ? (
            <Tab content={<AdminTabContent />} label="Admin" />
          ) : null}
        </Tabs>
      </div>
    </div>
  );
}
