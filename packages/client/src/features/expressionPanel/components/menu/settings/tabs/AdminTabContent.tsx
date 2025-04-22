import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";

export function AdminTabContent() {
  return (
    <ul>
      <li>
        <UnderlineButton>Revoke refresh token</UnderlineButton>
      </li>
      <li>
        <UnderlineButton>Generate email tokens</UnderlineButton>
      </li>
    </ul>
  );
}
