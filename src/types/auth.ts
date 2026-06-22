export type SessionUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

export type AuthSessionResult =
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" };

export type AuthConfigStatus = {
  clientConfigured: boolean;
  adminConfigured: boolean;
};
