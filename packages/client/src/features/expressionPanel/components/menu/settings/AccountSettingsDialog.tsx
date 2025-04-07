import UnderlineButton from "../../../../../components/buttons/common/UnderlineButton";
import Dialog from "../../../../../components/dialog/Dialog";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";

export function AccountSettingsDialog() {
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
      <Dialog ref={ref}>
        <DialogContent />
      </Dialog>
    </div>
  );
}

function DialogContent() {
  return null;
}
