"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider
      refetchInterval={0} // Disable automatic session polling
      refetchOnWindowFocus={false} // Don't refetch when window regains focus
    >
      {children}
    </NextAuthSessionProvider>
  );
}
