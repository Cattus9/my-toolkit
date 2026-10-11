import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[API /api/categories GET] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[API /api/categories GET] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("categories")
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error("[API /api/categories POST] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[API /api/categories POST] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    const supabase = createClient(await cookies());
    const websites = await supabase.from("tools").select("id").eq("category_id", id).limit(1);
    if (websites.error) throw new Error(websites.error.message);
    if (websites.data.length) return NextResponse.json({ error: "Remove all websites from this folder and its sub-folders before deleting it." }, { status: 409 });
    const children = await supabase.from("sub_categories").select("id").eq("category_id", id).limit(1);
    if (children.error) throw new Error(children.error.message);
    if (children.data.length) return NextResponse.json({ error: "Delete the empty sub-folders first." }, { status: 409 });
    const result = await supabase.from("categories").delete().eq("id", id).select("id");
    if (result.error) return NextResponse.json({ error: result.error.code === "23503" ? "This folder is no longer empty. Refresh and try again." : result.error.message }, { status: result.error.code === "23503" ? 409 : 500 });
    if (!result.data.length) return NextResponse.json({ error: "Folder not found or deletion is not permitted." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete folder." }, { status: 500 });
  }
}
