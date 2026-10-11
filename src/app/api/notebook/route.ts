import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function failure(error: { message: string; code?: string }) {
  return NextResponse.json({ error: error.code === "PGRST205" || error.code === "42P01"
    ? "Notebook database is not configured. Run the notebook SQL migration in Supabase."
    : error.message }, { status: 500 });
}

export async function GET() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.from("notebook_notes").select("*").order("updated_at", { ascending: false }).order("id");
  return error ? failure(error) : NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

async function save(request: Request, update: boolean) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !("title" in body) || typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 200 || !("content" in body) || typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ error: "Enter a title (up to 200 characters) and non-empty text." }, { status: 400 });
  }
  if (update && (!("id" in body) || typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id))) {
    return NextResponse.json({ error: "Valid note id is required." }, { status: 400 });
  }
  const supabase = createClient(await cookies());
  const values = { title: body.title.trim(), content: body.content, updated_at: new Date().toISOString() };
  const query = update && "id" in body ? supabase.from("notebook_notes").update(values).eq("id", body.id) : supabase.from("notebook_notes").insert(values);
  const { data, error } = await query.select().maybeSingle();
  if (error) return failure(error);
  if (!data) return NextResponse.json({ error: "Note not found." }, { status: 404 });
  return NextResponse.json(data, { status: update ? 200 : 201 });
}

export async function POST(request: Request) { return save(request, false); }
export async function PUT(request: Request) { return save(request, true); }

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: "Valid note id is required." }, { status: 400 });
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.from("notebook_notes").delete().eq("id", id).select("id").maybeSingle();
  if (error) return failure(error);
  if (!data) return NextResponse.json({ error: "Note not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
