import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Return each registered tool's URL and stored/fetched icon for the marquee.
    const { data, error } = await supabase
      .from("tools")
      .select("name, url, logo_url")
      .not("logo_url", "is", null)
      .limit(15);

    if (error) {
      console.error("[API /api/logos GET] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[API /api/logos GET] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
