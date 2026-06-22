import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/firebase-admin/config";

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function DELETE(): Promise<Response> {
  return POST();
}
