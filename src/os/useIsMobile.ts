import { useEffect, useState } from "react";

/** 和桌面图标、窗口全屏同一条线：窄于这个宽度就当手机 */
export const MOBILE_BREAKPOINT = 720;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
