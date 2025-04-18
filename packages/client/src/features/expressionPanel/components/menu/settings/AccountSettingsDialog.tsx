import { UserSessionData } from "@graphcalculator/types";
import UnderlineButton from "../../../../../components/buttons/common/UnderlineButton";
import Dialog from "../../../../../components/dialog/Dialog";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";
import Tabs from "../../../../../components/tabs/Tabs";
import { Tab } from "../../../../../components/tabs/Tab";

export function AccountSettingsDialog({ user }: { user: UserSessionData }) {
  const { ref, isOpen, setIsOpen } = useDialogContext();

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
      <Dialog>{isOpen && <DialogContent />}</Dialog>
    </div>
  );
}

function DialogContent() {
  return (
    <div className="account-settings-dialog">
      <div className="account-settings-dialog-header">
        <h2>Account Settings</h2>
        <div className="account-settings-dialog-body">
          <Tabs>
            <Tab content={<div>Tab Content 1</div>} label="Profile" />
            <Tab content={<div>Tab Content 2</div>} label="Password" />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
