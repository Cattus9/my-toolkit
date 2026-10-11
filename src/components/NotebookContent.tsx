"use client";

import { useEffect, useState } from "react";
import { Copy, NotebookPen, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Note = { id: string; title: string; content: string; created_at: string; updated_at: string };

export function NotebookContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notebook", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load notes.");
      setNotes(data);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not load notes."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadNotes(); }, []);

  async function saveNote(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || title.trim().length > 200 || !content.trim()) {
      setEditorError("Enter a title (up to 200 characters) and some text.");
      return;
    }
    setSaving(true);
    setEditorError("");
    try {
      const response = await fetch("/api/notebook", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing?.id, title, content }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save note.");
      setNotes((current) => [data, ...current.filter((note) => note.id !== data.id)]);
      setEditorOpen(false);
      setNotice("Note saved.");
    } catch (error) { setEditorError(error instanceof Error ? error.message : "Could not save note."); }
    finally { setSaving(false); }
  }

  async function deleteNote() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/notebook?id=${encodeURIComponent(deleting.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete note.");
      setNotes((current) => current.filter((note) => note.id !== deleting.id));
      setDeleting(null);
      setNotice("Note deleted.");
    } catch (error) { setDeleteError(error instanceof Error ? error.message : "Could not delete note."); }
    finally { setDeleteBusy(false); }
  }

  return <Shell>
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold flex items-center gap-2"><NotebookPen className="h-6 w-6" />Notebook</h1><p className="text-sm text-muted-foreground mt-2">Save text here. Open and copy it from another computer.</p></div>
        <Button disabled={loading || Boolean(error)} onClick={() => { setEditing(null); setTitle(""); setContent(""); setEditorError(""); setEditorOpen(true); }}><Plus className="h-4 w-4" />New note</Button>
      </header>
      <Alert className="text-xs">Public notebook: anyone with access to this website can read, edit, or delete these notes. Do not store secrets.</Alert>
      {notice && <Alert>{notice}</Alert>}
      {error && <Alert variant="destructive" className="space-y-2"><p>{error}</p><Button variant="outline" size="sm" onClick={loadNotes}>Reload notes</Button></Alert>}
      {loading ? <div className="space-y-3"><Skeleton className="h-36 rounded-xl" /><Skeleton className="h-36 rounded-xl" /></div> : !error && !notes.length ? <Card><CardContent className="py-12 text-center space-y-3"><NotebookPen className="h-8 w-8 mx-auto text-muted-foreground" /><h2 className="font-medium">No notes yet</h2><p className="text-sm text-muted-foreground">Choose New note, paste your text, and save it for later.</p></CardContent></Card> : !error && <div className="space-y-4">{notes.map((note) => <Card key={note.id} className="p-0"><CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="font-medium break-words">{note.title}</h2><time className="text-xs text-muted-foreground" dateTime={note.updated_at}>Updated {new Date(note.updated_at).toLocaleString()}</time></div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" aria-label={`Copy ${note.title}`} onClick={async () => { try { await navigator.clipboard.writeText(note.content); setNotice(`Copied “${note.title}”.`); } catch { setNotice("Clipboard access was blocked. Select the text below and copy it manually."); } }}><Copy className="h-3.5 w-3.5" />Copy</Button>
            <Button variant="ghost" size="sm" aria-label={`Edit ${note.title}`} onClick={() => { setEditing(note); setTitle(note.title); setContent(note.content); setEditorError(""); setEditorOpen(true); }}><Pencil className="h-3.5 w-3.5" />Edit</Button>
            <Button variant="ghost" size="sm" aria-label={`Delete ${note.title}`} onClick={() => { setDeleteError(""); setDeleting(note); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /><span className="sr-only">Delete</span></Button>
          </div>
        </div>
        <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-sm font-mono whitespace-pre-wrap break-words select-text">{note.content}</pre>
      </CardContent></Card>)}</div>}
    </div>
    <Dialog open={editorOpen} onOpenChange={(open) => { if (!saving) setEditorOpen(open); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto" showCloseButton={!saving}>
        <DialogHeader><DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle><DialogDescription>Text is saved exactly as entered, including spaces and line breaks.</DialogDescription></DialogHeader>
        <form onSubmit={saveNote} className="space-y-4">
          {editorError && <Alert variant="destructive">{editorError}</Alert>}
          <div className="space-y-2"><Label htmlFor="note-title">Title</Label><Input id="note-title" value={title} maxLength={200} disabled={saving} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Lab assignment" /></div>
          <div className="space-y-2"><Label htmlFor="note-content">Text</Label><Textarea id="note-content" className="min-h-64 max-h-[45dvh] overflow-auto font-mono text-sm" value={content} disabled={saving} onChange={(event) => setContent(event.target.value)} placeholder="Paste your text here..." /></div>
          <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save note</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !deleteBusy) setDeleting(null); }}>
      <DialogContent showCloseButton={!deleteBusy}>
        <DialogHeader><DialogTitle>Delete note?</DialogTitle><DialogDescription>“{deleting?.title}” will be permanently removed.</DialogDescription></DialogHeader>
        {deleteError && <Alert variant="destructive">{deleteError}</Alert>}
        <DialogFooter><Button variant="outline" disabled={deleteBusy} onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={deleteBusy} onClick={deleteNote}>{deleteBusy && <Loader2 className="h-4 w-4 animate-spin" />}Delete note</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </Shell>;
}
