import { ReactNode, useEffect, useRef, useState } from "react";
import { registerUser } from "../../../../../lib/api/actions";
import { useAppSelector } from "../../../../../state/hooks";
import { UserSessionData } from "@graphcalculator/types";
import { baseUrl, ORIGINS } from "../../../../../lib/api/config";
import { pollPopupClose } from "../../../../../helpers/dom";
import OAuthLink from "../../../../../components/buttons/link/OAuthLink";

export function OAuth2({
  stategies,
  onComplete,
}: {
  stategies: [ReactNode, string][];
  onComplete: (res: { data: { user: UserSessionData } }) => void;
}) {
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const popup = useRef<WindowProxy | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !popup.current) return;

    const abortController = new AbortController();
    const cleanup = pollPopupClose(popup.current, () => {
      popup.current = null;
      setIsOpen(false);
    });
    window.addEventListener(
      "message",
      (e) => {
        if (!ORIGINS.includes(e.origin as any)) return;
        if (!(e.data?.source === "graph calculator")) return;

        cleanup.clearPollRequest();
        popup.current = null;
        if (e.data.type === "oauth_success") {
          registerUser(e.data.token as string).then((res) => {
            setIsOpen(false);

            if ("error" in res) {
              return;
            }
            onComplete(res);
          });
        } else {
          setIsOpen(false);
        }
      },
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
      cleanup.clearPollRequest();
    };
  }, [isOpen]);

  return (
    <div className="oauth2-flow">
      {stategies.map((strategy) => (
        <OAuthLink
          key={strategy[1]}
          strategy={strategy}
          aria-disabled={isOpen}
          onClick={() => {
            popup.current = window.open(
              `${baseUrl}/auth/${strategy[1].toLowerCase()}`,
              "",
              isMobile ? "" : "popup,width=500px,height=500px"
            );
            setIsOpen(true);
          }}
        />
      ))}
    </div>
  );
}
