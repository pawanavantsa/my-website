"use client";

import { useEffect, useState } from "react";

/** True when the user has moved mouse or touched the page recently. */
export default function useUserActivity(timeoutMs = 4000) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const wake = () => {
      setActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setActive(false), timeoutMs);
    };

    window.addEventListener("mousemove", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("keydown", wake);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [timeoutMs]);

  return active;
}
