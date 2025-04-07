import { useRef } from "react";
import OutlinedButton from "../../../../components/buttons/common/OutlineButton";
import Dialog from "../../../../components/dialog/Dialog";
import Dropdown from "../../../../components/dropdown/Dropdown";
import Hr from "../../../../components/hr/Hr";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { useLazyFetch } from "../../../../hooks/api";
import { logoutUser } from "../../../../state/api/actions";
import { useGetUserQuery } from "../../../../state/api/apiSlice";
import { UserSessionData } from "../../../../state/api/types";
import {
  DialogProvider,
  useDialogContext,
} from "../../../../components/dialog/DialogContext";

export function AccountSettingsDropDown({ user }: { user: UserSessionData }) {
  return (
    <Dropdown className="account-settings-dropdown">
      <Dropdown.Button>
        <Dropdown.Label label={user.first_name} />
        <Dropdown.Chevron />
      </Dropdown.Button>
      <Dropdown.DialogMenu>
        <AccountSettings />
      </Dropdown.DialogMenu>
    </Dropdown>
  );
}

function AccountSettings({ toggle }: { toggle?: () => void }) {
  const data = useGetUserQuery(undefined, {
    selectFromResult({ data }) {
      return { data };
    },
  }).data;
  const [trigger, { data: res, isLoading, isError }] = useLazyFetch(logoutUser);

  if (!data) return null;

  return (
    <div className="account-settings">
      <div className="account-settings-credentials">
        <div>
          {data.first_name} {data.last_name}
        </div>
        <div>{data.email}</div>
      </div>

      <DialogProvider>
        <div></div>
      </DialogProvider>

      <Hr style={{ marginBlock: "1rem" }} />
      <div>
        <OutlinedButton
          className="button--hovered"
          style={{ backgroundColor: "white" }}
          onClick={trigger}
        >
          {isLoading ? (
            <div className="grid-center" style={{ width: "45px" }}>
              <Spinner />
            </div>
          ) : (
            "Logout"
          )}
        </OutlinedButton>
      </div>
    </div>
  );
}

function AccountSettingsDialog() {
  const { ref, isOpen, setIsOpen } = useDialogContext();

  return (
    <Dialog ref={ref}>
      <></>
    </Dialog>
  );
}
