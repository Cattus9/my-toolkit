import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase
      .from("sub_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[API /api/sub-categories GET] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[API /api/sub-categories GET] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, category_id } = await request.json();
    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Sub-category name and category_id are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("sub_categories")
      .insert({ name, category_id })
      .select()
      .single();

    if (error) {
      console.error("[API /api/sub-categories POST] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[API /api/sub-categories POST] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Sub-folder id is required" }, { status: 400 });
    const supabase = createClient(await cookies());
    const websites = await supabase.from("tools").select("id").eq("sub_category_id", id).limit(1);
    if (websites.error) throw new Error(websites.error.message);
    if (websites.data.length) return NextResponse.json({ error: "Remove all websites from this sub-folder before deleting it." }, { status: 409 });
    const result = await supabase.from("sub_categories").delete().eq("id", id).select("id");
    if (result.error) return NextResponse.json({ error: result.error.code === "23503" ? "This sub-folder is no longer empty. Refresh and try again." : result.error.message }, { status: result.error.code === "23503" ? 409 : 500 });
    if (!result.data.length) return NextResponse.json({ error: "Sub-folder not found or deletion is not permitted." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete sub-folder." }, { status: 500 });
  }
}
