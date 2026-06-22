export type AuthMode = "login" | "register";

export type AuthContextValue = {
  loading: boolean;
  configured: boolean;
  adminConfigured: boolean;
  user: import("firebase/auth").User | null;
  sessionReady: boolean;
  signOut: () => Promise<void>;
};

export type AuthProviderProps = {
  children: React.ReactNode;
  configured: boolean;
  adminConfigured: boolean;
};
