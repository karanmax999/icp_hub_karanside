import React from "react";
import { useAuthClient } from "../hooks/useAuthClient";

export default function SignIn() {
  const { principal, login, logout } = useAuthClient();

  if (principal) {
    return (
      <div>
        ✅ Signed in as: <code>{principal}</code>
        <br />
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return <button onClick={login}>Sign In with Internet Identity</button>;
}
