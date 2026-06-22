"use client";

import { useAuthContext } from "@/features/auth/components/auth-provider";

export function useAuth() {
  return useAuthContext();
}
