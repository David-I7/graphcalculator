import OutlinedButton from "../../../../../components/buttons/common/OutlineButton";
import Dropdown from "../../../../../components/dropdown/Dropdown";
import Hr from "../../../../../components/hr/Hr";
import Spinner from "../../../../../components/Loading/Spinner/Spinner";
import { useLazyFetch } from "../../../../../hooks/api";
import { logoutUser } from "../../../../../state/api/actions";
import { DialogProvider } from "../../../../../components/dialog/DialogContext";
import { UserSessionData } from "@graphcalculator/types";
import { lazy, Suspense } from "react";
import UnderlineButton from "../../../../../components/buttons/common/UnderlineButton";
const AccountSettingsDialog = lazy(() =>
  import("./AccountSettingsDialog").then((res) => ({
    default: res.AccountSettingsDialog,
  }))
);

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
  const [trigger, { data: res, isLoading, isError, error }] = useLazyFetch(() =>
    logoutUser().then((res) => {
      if (res) throw new Error(res.error.message);
      window.location.reload();
    })
  );

  return (
    <div className="account-settings" onClick={(e) => e.stopPropagation()}>
      <div className="account-settings-credentials">
        <div>
          {user.first_name} {user.last_name}
        </div>
        <div>{user.email}</div>
      </div>

      {user.provider === 0 && (
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
      )}

      <Hr
        style={
          user.provider === 0
            ? { marginBottom: "1rem" }
            : { marginBlock: "1rem" }
        }
      />
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
