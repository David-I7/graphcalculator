import { useEffect } from "react";
import styles from "../components/scrim/scrim.module.scss";

export function usePopulateRef<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  opt: { selector?: string; id?: string; cb?: () => T }
) {
  useEffect(() => {
    if (opt.cb) {
      ref.current = opt.cb();
    } else if (opt.id) {
      ref.current = document.getElementById(opt.id) as T;
    } else if (opt.selector) {
      ref.current = document.querySelector(opt.selector) as T;
    }
  }, []);
}

type ScrimProps = {
  enabled: boolean;
  container: HTMLElement;
  className?: string;
  style?: string;
  onClose: () => void;
};

export function useScrim({
  enabled = true,
  container,
  className,
  style,
  onClose,
}: ScrimProps) {
  useEffect(() => {
    if (!enabled) return;

    const eventController = new AbortController();
    function createScrim(): Node {
      const div = document.createElement("div");
      div.className = className ? `${className} ${styles.scrim}` : styles.scrim;
      div.style = style ?? "";
      div.addEventListener(
        "click",
        (e) => {
          if (e.target === e.currentTarget) {
            onClose;
            eventController.abort();
          }
        },
        { signal: eventController.signal }
      );
      return div;
    }

    const scrim = createScrim();
    container.appendChild(createScrim());

    return () => {
      eventController.abort();
      container.removeChild(scrim);
    };
  }, [enabled, container, className, style, onClose]);
}
