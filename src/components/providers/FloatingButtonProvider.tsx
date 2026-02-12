"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Context to allow child components to hide the floating "Talk to Us" button
type FloatingButtonContextType = {
  hideCount: number;
  incrementHideCount: () => void;
  decrementHideCount: () => void;
};

const FloatingButtonContext = createContext<FloatingButtonContextType | null>(
  null
);

/**
 * Provider component for the floating button hide/show functionality.
 * Wrap the root layout with this provider.
 */
export function FloatingButtonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hideCount, setHideCount] = useState(0);

  const incrementHideCount = () => setHideCount((c) => c + 1);
  const decrementHideCount = () => setHideCount((c) => Math.max(0, c - 1));

  return (
    <FloatingButtonContext.Provider
      value={{ hideCount, incrementHideCount, decrementHideCount }}
    >
      {children}
    </FloatingButtonContext.Provider>
  );
}

/**
 * Hook to hide the floating "Talk to Us" button when a dialog is open.
 * Call this hook with the dialog's open state.
 */
export function useHideFloatingButton(isOpen: boolean) {
  const context = useContext(FloatingButtonContext);

  useEffect(() => {
    if (!context) return;

    if (isOpen) {
      context.incrementHideCount();
    }

    return () => {
      if (isOpen) {
        context.decrementHideCount();
      }
    };
  }, [isOpen, context]);
}

/**
 * Hook to get the current hide count for the floating button.
 * Used by AppLayout to conditionally render the FAB.
 */
export function useFloatingButtonHideCount(): number {
  const context = useContext(FloatingButtonContext);
  return context?.hideCount ?? 0;
}
