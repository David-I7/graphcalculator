import { ReactNode, useEffect, useRef, useState } from "react";
import { registerUser } from "../../../../../state/api/actions";
import { useAppSelector } from "../../../../../state/hooks";
import { UserSessionData } from "@graphcalculator/types";
import { baseUrl, ORIGINS } from "../../../../../state/api/config";

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
    if (!isOpen) return;

    const abortController = new AbortController();

    window.addEventListener(
      "message",
      (e) => {
        console.log(e);
        if (!ORIGINS.includes(e.origin as any)) return;
        if (!(e.data?.source === "graph calculator")) return;

        setIsOpen(false);
        if (e.data.type === "oauth_success") {
          registerUser(e.data.token as string).then((res) => {
            console.log(res);
            if ("error" in res) {
              return;
            }
            onComplete(res);
          });
        }
      },
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
      if (isOpen) {
        popup.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div className="oauth2-flow">
      {stategies.map((stategy) => (
        <a
          key={stategy[1]}
          aria-disabled={isOpen}
          className="oauth2-login-button"
          onClick={() => {
            popup.current = window.open(
              `${baseUrl}/api/auth/${stategy[1].toLowerCase()}`,
              "",
              isMobile ? "" : "popup,width=500px,height=500px"
            );
            setIsOpen(true);
          }}
        >
          {stategy[0]} Continue with {stategy[1]}
        </a>
      ))}
    </div>
  );
}
