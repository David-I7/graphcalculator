import { useEffect, useState } from "react";
import UnderlineButton from "../../../../../../components/buttons/common/UnderlineButton";
import { baseUrl, ORIGINS } from "../../../../../../lib/api/config";
import { useAppSelector } from "../../../../../../state/hooks";
import { CSS_VARIABLES } from "../../../../../../data/css/variables";
import { useLazyFetch } from "../../../../../../hooks/api";
import { revokeEmailTokens } from "../../../../../../lib/api/actions";

export function AdminTabContent() {
  return (
    <div className="admin-tab">
      <h3>Actions</h3>
      <ul>
        <RevokeTokens />
        <GenerateEmailTokens />
      </ul>
    </div>
  );
}

function RevokeTokens() {
  const [trigger, { data, isError, isLoading }] =
    useLazyFetch(revokeEmailTokens);

  return (
    <li>
      <UnderlineButton
        onClick={() => {
          if (isLoading) return;
          trigger();
        }}
        disabled={isLoading}
      >
        Revoke tokens
      </UnderlineButton>
      {isError && <div style={{ color: CSS_VARIABLES.error }}>Failed</div>}
      {data && <div>Success</div>}
    </li>
  );
}

function GenerateEmailTokens() {
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const [requestState, setRequestState] = useState({
    isInitialized: false,
    isSuccess: false,
  });

  useEffect(() => {
    if (!isOpenPopup) return;
    const aborter = new AbortController();

    const popup = window.open(
      `${baseUrl}/auth/email`,
      "",
      isMobile ? "" : "popup,width=500px,height=500px"
    );

    const interval = setInterval(() => {
      if (popup?.closed) {
        setTimeout(() => {
          setRequestState({ isInitialized: true, isSuccess: false });
          setIsOpenPopup(false);
        });
      }
    }, 500);

    window.addEventListener(
      "message",
      (e) => {
        if (!ORIGINS.includes(e.origin as any)) return;
        if (!(e.data?.source === "graph calculator")) return;

        if ((e.data.type = "email-success")) {
          setRequestState({ isInitialized: true, isSuccess: true });
        } else {
          setRequestState({ isInitialized: true, isSuccess: false });
        }
        setIsOpenPopup(false);
      },
      { signal: aborter.signal }
    );

    return () => {
      aborter.abort();
      clearInterval(interval);
    };
  }, [isOpenPopup]);

  return (
    <li>
      <UnderlineButton
        disabled={isOpenPopup}
        onClick={() => {
          setIsOpenPopup(true);
        }}
      >
        Generate email tokens
      </UnderlineButton>
      {requestState.isInitialized && requestState.isSuccess && (
        <div>Success</div>
      )}
      {requestState.isInitialized && !requestState.isSuccess && (
        <div style={{ color: CSS_VARIABLES.error }}>Failed</div>
      )}
    </li>
  );
}
