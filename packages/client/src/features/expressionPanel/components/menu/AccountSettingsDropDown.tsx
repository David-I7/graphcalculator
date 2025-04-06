import Dropdown from "../../../../components/dropdown/Dropdown";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { useLazyFetch } from "../../../../hooks/api";
import { logoutUser } from "../../../../state/api/actions";
import { useGetUserQuery } from "../../../../state/api/apiSlice";
import { UserSessionData } from "../../../../state/api/types";

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
    <div className="account-settings-dropdown-content">
      <div>
        {data.first_name}
        {data.email}
      </div>
      <div>
        <button onClick={trigger}>{isLoading ? <Spinner /> : "logout"}</button>
      </div>
    </div>
  );
}
