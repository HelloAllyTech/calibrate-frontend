"use client";

import { useSession } from "next-auth/react";

// This is a CLIENT-SIDE component that shows what the browser sees
// NEXT_PUBLIC_* vars are embedded at BUILD time, not runtime

export default function DebugClientPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, status } = useSession();
  const backendAccessToken = (session as any)?.backendAccessToken;
  
  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Client-Side Environment Debug</h1>
      
      <h2 style={{ marginTop: "1.5rem" }}>1. Environment Variable</h2>
      <pre style={{ background: "#1a1a1a", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
        {JSON.stringify({
          NEXT_PUBLIC_BACKEND_URL: backendUrl || "NOT SET / EMPTY",
          typeof_backendUrl: typeof backendUrl,
        }, null, 2)}
      </pre>
      
      <h2 style={{ marginTop: "1.5rem" }}>2. Session & Backend Token</h2>
      <pre style={{ background: "#1a1a1a", color: "#fff", padding: "1rem", borderRadius: "8px" }}>
        {JSON.stringify({
          sessionStatus: status,
          hasBackendAccessToken: !!backendAccessToken,
          backendAccessTokenPreview: backendAccessToken 
            ? backendAccessToken.substring(0, 20) + "..." 
            : "NOT SET",
          backendUser: (session as any)?.backendUser || "NOT SET",
        }, null, 2)}
      </pre>
      
      {!backendAccessToken && status === "authenticated" && (
        <p style={{ marginTop: "1rem", color: "#ff6b6b", fontWeight: "bold" }}>
          ⚠️ You are logged in but backendAccessToken is missing!<br/>
          This means you logged in when the backend was not reachable.<br/>
          <strong>Solution: Log out and log back in.</strong>
        </p>
      )}
    </div>
  );
}
