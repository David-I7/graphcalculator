import { UserSessionData } from "@graphcalculator/types";
import FormInput from "../../../../../../components/input/FormInput";
import { useId, useState } from "react";
import FilledButton from "../../../../../../components/buttons/common/FilledButton";

export function ProfileTabContent({ user }: { user: UserSessionData }) {
  return <div className="profile-tab"></div>;
}

function ChangeCredentialsForm({ user }: { user: UserSessionData }) {
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name || "");
  const firstNameId = useId();
  const lastNameId = useId();

  return (
    <form>
      <div>
        <div>
          <label htmlFor={firstNameId}>First Name</label>
          <FormInput
            id={firstNameId}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={lastNameId}>Last Name(optional)</label>
          <FormInput
            id={lastNameId}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <FilledButton>Save</FilledButton>
    </form>
  );
}
