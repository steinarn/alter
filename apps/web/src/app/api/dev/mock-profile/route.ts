import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  MOCK_PROFILE_COOKIE,
  getMockProfile,
  isMockProfilesEnabled,
} from "@/mock/personas";

const requestSchema = z.object({
  profileId: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  if (!isMockProfilesEnabled()) {
    return NextResponse.json({ error: "Mock profiles are disabled" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const profileId = parsed.data.profileId;

  if (!profileId) {
    cookieStore.delete(MOCK_PROFILE_COOKIE);
    return NextResponse.json({ activeProfileId: null });
  }

  const profile = getMockProfile(profileId);

  if (!profile) {
    return NextResponse.json({ error: "Unknown mock profile" }, { status: 404 });
  }

  cookieStore.set(MOCK_PROFILE_COOKIE, profile.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ activeProfileId: profile.id });
}
