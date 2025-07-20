import { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";

const II_URL =
  process.env.NEXT_PUBLIC_DFX_LOCALHOST && process.env.NEXT_PUBLIC_II_CANISTER_ID
    ? `${process.env.NEXT_PUBLIC_DFX_LOCALHOST}?canisterId=${process.env.NEXT_PUBLIC_II_CANISTER_ID}`
    : "https://identity.ic0.app";

export function useAuthClient() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;

    await authClient.login({
      identityProvider: II_URL,
      onSuccess: () => {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toText());
      },
    });
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setPrincipal(null);
    }
  };

  return {
    authClient,
    principal,
    login,
    logout,
  };
}
