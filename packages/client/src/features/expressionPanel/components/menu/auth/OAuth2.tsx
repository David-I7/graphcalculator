import { ReactNode, useEffect, useRef, useState } from "react";
import { UserSessionData } from "../../../../../state/api/types";
import { registerUser } from "../../../../../state/api/actions";
import { useAppSelector } from "../../../../../state/hooks";

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

    const interval = setInterval(() => {
      // triggered if user closes tab
      if (popup.current && popup.current.closed) {
        setIsOpen(false);
      }
    }, 500);

    window.addEventListener(
      "message",
      (e) => {
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
      clearInterval(interval);
      popup.current = null;
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
              `http://localhost:8080/api/auth/${stategy[1].toLowerCase()}`,
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
