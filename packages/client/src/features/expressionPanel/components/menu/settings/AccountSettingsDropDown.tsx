import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import Dropdown from "../../../../../components/dropdown/Dropdown";
import Hr from "../../../../../components/hr/Hr";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import { useLazyFetch } from "../../../../../hooks/api";
import { logoutUser } from "../../../../../state/api/actions";
import { DialogProvider } from "../../../../../components/dialog/DialogContext";
import { UserSessionData } from "@graphcalculator/types";
import { Suspense } from "react";
import UnderlineButton from "../../../../../components/buttons/common/UnderlineButton";
import { AccountSettingsDialog } from "./AccountSettingsDialog";

export function AccountSettingsDropDown({ user }: { user: UserSessionData }) {
  return (
    <Dropdown className="account-settings-dropdown">
      <Dropdown.Button>
        <Dropdown.Label label={user.first_name} />
        <Dropdown.Chevron />
      </Dropdown.Button>
      <Dropdown.DialogMenu>
        <AccountSettings user={user} />
      </Dropdown.DialogMenu>
    </Dropdown>
  );
}

function AccountSettings({
  toggle,
  user,
}: {
  toggle?: () => void;
  user: UserSessionData;
}) {
  return (
    <div className="account-settings" onClick={(e) => e.stopPropagation()}>
      <div className="account-settings-credentials">
        <div>
          {user.first_name} {user.last_name}
        </div>
        <div>{user.email}</div>
      </div>

      <DialogProvider>
        <Suspense
          fallback={
            <UnderlineButton style={{ marginTop: "1rem" }}>
              Account settings
            </UnderlineButton>
          }
        >
          <AccountSettingsDialog user={user} />
        </Suspense>
      </DialogProvider>

      <Hr style={{ marginBottom: "1rem" }} />
      <LogoutUser />
    </div>
  );
}

function LogoutUser() {
  const [trigger, { isLoading }] = useLazyFetch(() =>
    logoutUser().then((res) => {
      if (!(typeof res === "string")) throw new Error(res.error.message);
      window.location.reload();
    })
  );
  return (
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
  );
}
