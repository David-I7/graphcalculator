import { UserSessionData } from "@graphcalculator/types";
import FormInput from "../../../../../../components/input/FormInput";
import { useId, useState } from "react";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import Spinner from "../../../../../../components/Loading/Spinner/Spinner";
import { useLazyFetch } from "../../../../../../hooks/api";
import { updateUserCredentials } from "../../../../../../lib/api/actions";
import apiSlice from "../../../../../../state/api/apiSlice";
import { useAppDispatch } from "../../../../../../state/hooks";
import DeleteAccount from "../deleteAccount/DeleteAccount";
import VerifyEmailDialog from "../emailVerification/VerifyEmailDialog";
import { DialogProvider } from "../../../../../../components/dialog/DialogContext";

export function ProfileTabContent({
  user,
  closeDialog,
}: {
  user: UserSessionData;
  closeDialog: () => void;
}) {
  return (
    <div className="profile-tab">
      <div>
        <ChangeCredentialsForm closeDialog={closeDialog} user={user} />
        <div className="profile-tab-email-status">
          <dl>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </dl>
          {!user.email_is_verified && (
            <DialogProvider>
              <VerifyEmailDialog email={user.email} />
            </DialogProvider>
          )}
          {user.email_is_verified && (
            <div className="profile-tab-email-status-verified">Verfied</div>
          )}
        </div>
      </div>

      <DeleteAccount user={user} />
    </div>
  );
}

function ChangeCredentialsForm({
  user,
  closeDialog,
}: {
  user: UserSessionData;
  closeDialog: () => void;
}) {
  const dispatch = useAppDispatch();
  const [trigger, { isLoading, error, reset }] = useLazyFetch(() =>
    updateUserCredentials({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    }).then((res) => {
      if ("error" in res) return;
      upsertUserSessionData(res);
      closeDialog();
    })
  );
  const upsertUserSessionData = (data: { data: { user: UserSessionData } }) => {
    dispatch(
      apiSlice.util.upsertQueryData(
        "getUser",
        undefined,
        //@ts-ignore
        data
      )
    );
  };
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name || "");
  const firstNameId = useId();
  const lastNameId = useId();

  return (
    <form
      className="user-credentials-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading) return;
        trigger();
      }}
    >
      <div>
        <div>
          <label htmlFor={firstNameId}>First name</label>
          <FormInput
            id={firstNameId}
            value={firstName}
            onChange={(e) => {
              if (error) reset();
              setFirstName(e.target.value);
            }}
          />
        </div>
        <div>
          <label htmlFor={lastNameId}>Last name(optional)</label>
          <FormInput
            id={lastNameId}
            value={lastName}
            onChange={(e) => {
              if (error) reset();
              setLastName(e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        {error && (
          <div style={{ color: CSS_VARIABLES.error }}>{error.message}</div>
        )}
        <FilledButton
          disabled={
            !firstName ||
            (firstName === user.first_name &&
              lastName === (user.last_name ?? ""))
          }
        >
          {isLoading ? (
            <div
              style={{
                display: "grid",
                placeContent: "center",
                width: "31px",
              }}
            >
              <Spinner
                style={{
                  borderColor: CSS_VARIABLES.onPrimary,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            "Save"
          )}
        </FilledButton>
      </div>
    </form>
  );
}
