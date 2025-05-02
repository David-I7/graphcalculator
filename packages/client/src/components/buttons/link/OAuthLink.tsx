import { AnchorHTMLAttributes, ReactNode, useMemo } from "react";
import styles from "./assets/link.module.scss";

type OAuthLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  strategy: [ReactNode, string];
};

const OAuthLink = ({ strategy, ...props }: OAuthLinkProps) => {
  const mergedClassname = useMemo(() => {
    return props.className
      ? props.className.concat(" ", styles.oauth2LoginButton)
      : styles.oauth2LoginButton;
  }, [props.className]);

  return (
    <a {...props} className={mergedClassname}>
      {strategy[0]} Continue with {strategy[1]}
    </a>
  );
};

export default OAuthLink;
