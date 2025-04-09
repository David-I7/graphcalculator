import { ReactNode, useEffect, useRef, useState } from "react";
import { UserSessionData } from "../../../../../state/api/types";
import { registerUser } from "../../../../../state/api/actions";

export function OAuth2({
  stategies,
  onComplete,
}: {
  stategies: [ReactNode, string][];
  onComplete: (user: UserSessionData) => void;
}) {
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
        setIsOpen(false);

        console.log(e.data);
        if (e.data.type === "oauth_success") {
          registerUser(e.data.token as string).then((res) => {
            if ("error" in res) {
              return;
            }
            onComplete(res.data.user);
          });
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
              "popup,width=500px,height=500px"
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
