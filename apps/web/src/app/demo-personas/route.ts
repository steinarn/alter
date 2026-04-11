import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_PROFILE_COOKIE,
  getMockProfileSummaries,
  isMockProfilesEnabled,
} from "@/mock/personas";

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/dashboard", request.url);

  if (!isMockProfilesEnabled()) {
    return NextResponse.redirect(redirectUrl);
  }

  const defaultProfile = getMockProfileSummaries()[0];
  const cookieStore = await cookies();

  if (defaultProfile) {
    cookieStore.set(MOCK_PROFILE_COOKIE, defaultProfile.id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  } else {
    cookieStore.delete(MOCK_PROFILE_COOKIE);
  }

  return NextResponse.redirect(redirectUrl);
}
