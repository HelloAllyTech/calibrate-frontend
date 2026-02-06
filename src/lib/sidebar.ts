import { useState, useEffect } from "react";

/**
 * Hook to manage sidebar state based on screen size.
 * Desktop (>=768px): open by default
 * Mobile (<768px): closed by default
 *
 * Returns [sidebarOpen, setSidebarOpen] tuple.
 * The state is initialized after mount to avoid hydration mismatch.
 */
export const useSidebarState = (): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const isDesktop = window.innerWidth >= 768;
      setSidebarOpen(isDesktop);
      setInitialized(true);
    }
  }, [initialized]);

  return [sidebarOpen, setSidebarOpen];
};
