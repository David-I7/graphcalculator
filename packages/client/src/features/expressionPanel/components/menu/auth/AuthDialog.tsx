import Dialog from "../../../../../components/dialog/Dialog";
import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../../components/buttons/common/FilledButton";
import FormProgress from "./FormProgress";
import { useAppDispatch } from "../../../../../state/hooks";
import { UserSessionData } from "../../../../../state/api/types";
import apiSlice from "../../../../../state/api/apiSlice";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";

const AuthDialog = () => {
  const { isOpen, setIsOpen, ref } = useDialogContext();
  const dispatch = useAppDispatch();
  const onComplete = (res: { data: { user: UserSessionData } }) => {
    setIsOpen(!isOpen);
    dispatch(
      apiSlice.util.upsertQueryData(
        "getUser",
        undefined,
        //@ts-expect-error
        res
      )
    );
  };

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
      <Dialog
        ref={ref}
        onClose={(e) => setIsOpen(false)}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        {isOpen && (
          <div className="auth-dialog-content">
            <FormProgress onComplete={onComplete} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AuthDialog;
