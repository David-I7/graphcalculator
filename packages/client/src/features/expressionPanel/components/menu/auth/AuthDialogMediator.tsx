import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import AuthDialog from "./AuthDialog";

const AuthDialogMediator = () => {
  const { isOpen, setIsOpen } = useDialogContext();
  return (
    <div className="auth-dialog">
      <div>
        <OutlinedButton
          theme="dark"
          className="bg-inverse-surface-high inverse-button--hovered"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Log in
        </OutlinedButton>
        or
        <FilledButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          Sign up
        </FilledButton>
      </div>
      to save your graphs!
      <AuthDialog />
    </div>
  );
};

export default AuthDialogMediator;
