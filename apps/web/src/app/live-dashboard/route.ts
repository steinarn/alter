import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROFILE_COOKIE } from "@/mock/personas";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_PROFILE_COOKIE);

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
