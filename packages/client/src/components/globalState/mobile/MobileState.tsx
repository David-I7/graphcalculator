import { useAppSelector, useAppDispatch } from "../../../state/hooks";
import { useEffect } from "react";
import { updateIsMobile } from "../../../state/global/global";
import { MOBILE_BREAKPOINT } from "../../../data/css/breakpoints";
import { throttle } from "../../../helpers/performance";

const MobileState = () => {
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const eventCrontroller = new AbortController();

    const throttledResize = throttle(() => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        if (!isMobile) {
          dispatch(updateIsMobile(true));
        }
      } else {
        if (isMobile) {
          dispatch(updateIsMobile(false));
        }
      }
    }, 50);

    window.addEventListener("resize", throttledResize.throttleFunc, {
      signal: eventCrontroller.signal,
    });

    return () => {
      eventCrontroller.abort();
      throttledResize.abort();
    };
  }, [isMobile]);

  return null;
};

export default MobileState;
