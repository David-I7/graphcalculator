import Dialog from "../../../../../components/dialog/Dialog";
import FormProgress from "./FormProgress";
import { useAppDispatch } from "../../../../../state/hooks";
import apiSlice from "../../../../../state/api/apiSlice";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";
import { UserSessionData } from "@graphcalculator/types";

const AuthDialog = () => {
  const { isOpen, setIsOpen } = useDialogContext();
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
    <Dialog
      responsive={false}
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
  );
};

export default AuthDialog;
