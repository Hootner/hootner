import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { User } from "@/shared/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  loginWithWebAuthn: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const COGNITO_ENDPOINT = "/api/auth";

/**
 * Auth hook connected to hootner's Cognito + FIDO2/WebAuthn system (Layer 0).
 * Replaces the mock auth from enterprise-p.
 */
export function useAuth(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${COGNITO_ENDPOINT}/session`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({ ...prev, isAuthenticated: false, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${COGNITO_ENDPOINT}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Authentication failed");
      }

      const data = await response.json();
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Login failed",
      }));
    }
  }, []);

  const loginWithWebAuthn = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Get challenge from server
      const challengeResponse = await fetch(`${COGNITO_ENDPOINT}/webauthn/challenge`, {
        method: "POST",
        credentials: "include",
      });
      const challengeData = await challengeResponse.json();

      // Use WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challengeData.challenge), (c) =>
            c.charCodeAt(0)
          ),
          rpId: window.location.hostname,
          allowCredentials: challengeData.allowCredentials,
          timeout: 60000,
        },
      });

      // Verify with server
      const verifyResponse = await fetch(`${COGNITO_ENDPOINT}/webauthn/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      if (!verifyResponse.ok) throw new Error("WebAuthn verification failed");

      const data = await verifyResponse.json();
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "WebAuthn login failed",
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${COGNITO_ENDPOINT}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const refreshSession = useCallback(async () => {
    await checkSession();
  }, []);

  return { ...state, login, loginWithWebAuthn, logout, refreshSession };
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
