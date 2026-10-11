"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { ToolCard } from "@/components/ToolCard";
import { AddToolForm } from "@/components/AddToolForm";
import { EditToolModal } from "@/components/EditToolModal";
import type { Tool, Category, SubCategory } from "@/types/database";
import {
  Plus, Search, Loader2, FolderOpen, Trash2, ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAddingParam = searchParams.get("add") === "true";
  const { folder = [] } = useParams<{ folder?: string[] }>();
  const pathname = usePathname();
  const categoryId = folder[0];
  const subfolderId = folder[1];

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Tool | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string; kind: "category" | "subfolder" } | null>(null);
  const [folderDeleting, setFolderDeleting] = useState(false);
  const [folderDeleteError, setFolderDeleteError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const activeCategory = categories.find((category) => category.id === categoryId);
  const activeSubfolder = subCategories.find((sub) => sub.id === subfolderId && sub.category_id === categoryId);
  const [addLinkOpen, setAddLinkOpen] = useState(isAddingParam);
  const [subfolderOpen, setSubfolderOpen] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [subfolderSaving, setSubfolderSaving] = useState(false);
  const [subfolderError, setSubfolderError] = useState("");

  useEffect(() => {
    setSearchQuery("");
    setSubfolderOpen(false);
  }, [pathname]);

  async function fetchData() {
    try {
      setLoading(true);
      const [toolsRes, catRes, subRes] = await Promise.all([
        fetch("/api/tools"),
        fetch("/api/categories"),
        fetch("/api/sub-categories"),
      ]);

      if (toolsRes.ok) setTools(await toolsRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (subRes.ok) setSubCategories(await subRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => setAddLinkOpen(isAddingParam), [isAddingParam]);

  async function handleAddSubfolder(event: React.FormEvent) {
    event.preventDefault();
    if (!activeCategory || subfolderId || !subfolderName.trim()) {
      setSubfolderError("Enter a sub-folder name inside a category folder.");
      return;
    }
    setSubfolderSaving(true);
    setSubfolderError("");
    try {
      const response = await fetch("/api/sub-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: subfolderName.trim(), category_id: activeCategory.id }) });
      if (!response.ok) throw new Error((await response.json()).error || "Could not create sub-folder");
      setSubfolderName(""); setSubfolderOpen(false); await fetchData();
    } catch (error) { setSubfolderError(error instanceof Error ? error.message : "Could not create sub-folder"); }
    finally { setSubfolderSaving(false); }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleDelete(id: string) {
    const candidate = tools.find((tool) => tool.id === id);
    if (!candidate) return;
    setDeleteError("");
    setDeleteCandidate(candidate);
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/tools?id=${deleteCandidate.id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not delete this website.");
      }
      setTools((current) => current.filter((tool) => tool.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete this website.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function confirmFolderDelete() {
    if (!folderToDelete) return;
    setFolderDeleting(true);
    setFolderDeleteError("");
    try {
      const endpoint = folderToDelete.kind === "category" ? "categories" : "sub-categories";
      const response = await fetch(`/api/${endpoint}?id=${encodeURIComponent(folderToDelete.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not delete folder.");
      }
      setFolderToDelete(null);
      await fetchData();
    } catch (error) {
      setFolderDeleteError(error instanceof Error ? error.message : "Could not delete folder.");
    } finally {
      setFolderDeleting(false);
    }
  }

  const query = searchQuery.trim().toLowerCase();
  const invalidFolder = Boolean(categoryId && (!activeCategory || (subfolderId && !activeSubfolder)));
  const visibleFolders = !categoryId
    ? categories.filter((category) => category.name.toLowerCase().includes(query))
    : !subfolderId
      ? subCategories.filter((sub) => sub.category_id === categoryId && sub.name.toLowerCase().includes(query))
      : [];
  const visibleTools = categoryId && !invalidFolder ? tools.filter((tool) =>
    tool.category_id === categoryId &&
    (subfolderId ? tool.sub_category_id === subfolderId : !tool.sub_category_id) &&
    (!query || `${tool.name} ${tool.description || ""} ${tool.url}`.toLowerCase().includes(query))
  ) : [];
  const title = activeSubfolder?.name || activeCategory?.name || "Resource Library";
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3";
  function closeAddLink() {
    setAddLinkOpen(false);
    if (isAddingParam) router.replace(pathname);
  }

  return (
    <Shell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <nav aria-label="Folder breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/dashboard" className="hover:text-foreground">All folders</Link>
          {activeCategory && <><ChevronRight className="h-3.5 w-3.5" /><Link href={`/dashboard/${encodeURIComponent(activeCategory.id)}`} className="hover:text-foreground" aria-current={!subfolderId ? "page" : undefined}>{activeCategory.name}</Link></>}
          {activeSubfolder && <><ChevronRight className="h-3.5 w-3.5" /><span aria-current="page" className="text-foreground">{activeSubfolder.name}</span></>}
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-xs text-muted-foreground mt-2">{!categoryId ? "Choose a category folder to explore your resources." : subfolderId ? "Websites saved in this sub-folder." : "Open a sub-folder or browse websites saved directly in this folder."}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button disabled={loading || !activeCategory || Boolean(subfolderId)} onClick={() => { setSubfolderError(""); setSubfolderOpen(true); }} variant="outline" size="sm" className="gap-1.5 text-xs">
              <FolderOpen className="h-4 w-4" />New sub-folder
            </Button>
            <Button disabled={invalidFolder} onClick={() => setAddLinkOpen(true)} size="sm" className="gap-1.5 text-xs"><Plus className="h-4 w-4" />Add Link</Button>
          </div>
        </div>
        <div className="pt-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input aria-label="Search current folder" placeholder={!categoryId ? "Search category folders..." : "Search this folder..."} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 h-9 text-xs" />
          </div>
          {loading ? (
            <div className={gridClass}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          ) : invalidFolder ? (
            <Alert variant="destructive">Folder not found. <Link href="/dashboard" className="underline">Return to all folders</Link>.</Alert>
          ) : (
            <>
              {visibleFolders.length > 0 && <section aria-label={!categoryId ? "Category folders" : "Sub-folders"}>
                <h2 className="text-sm font-medium mb-3">{!categoryId ? "Categories" : "Sub-folders"}</h2>
                <div className={gridClass}>{visibleFolders.map((item) => {
                  const href = !categoryId ? `/dashboard/${encodeURIComponent(item.id)}` : `${pathname}/${encodeURIComponent(item.id)}`;
                  const count = tools.filter((tool) => !categoryId ? tool.category_id === item.id : tool.category_id === categoryId && tool.sub_category_id === item.id).length;
                  const hasSubfolders = !categoryId && subCategories.some((sub) => sub.category_id === item.id);
                  const blocked = count > 0 || hasSubfolders;
                  return <Card key={item.id} className="h-full p-0 border-border/70 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <Link href={href} className="block space-y-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <FolderOpen className="h-8 w-8 text-primary" />
                        <h3 className="text-sm font-medium break-words">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{count} websites</p>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" disabled={blocked} title={count ? "Remove stored websites first" : hasSubfolders ? "Delete empty sub-folders first" : "Delete empty folder"} aria-label={`Delete folder ${item.name}`} onClick={() => { setFolderDeleteError(""); setFolderToDelete({ id: item.id, name: item.name, kind: categoryId ? "subfolder" : "category" }); }}>
                        <Trash2 className="h-3.5 w-3.5" />Delete
                      </Button>
                    </CardContent>
                  </Card>;
                })}</div>
              </section>}
              {categoryId && visibleTools.length > 0 && <section aria-label="Websites">
                <h2 className="text-sm font-medium mb-3">Websites <Badge variant="secondary" className="ml-2">{visibleTools.length}</Badge></h2>
                <div className={gridClass}>{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} onDelete={handleDelete} onEdit={setEditingTool} />)}</div>
              </section>}
              {!visibleFolders.length && !visibleTools.length && <Card className="p-0 border-dashed bg-card/40">
                <CardContent className="p-8 text-center space-y-3">
                  <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h2 className="text-sm font-medium">{query ? "No matches in this folder" : !categoryId ? "No category folders yet" : "This folder is empty"}</h2>
                  <p className="text-xs text-muted-foreground">{query ? "Try another search. Contents of nested folders are not searched here." : "Use Add Link to save a resource to your library."}</p>
                  {query && <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>Clear search</Button>}
                </CardContent>
              </Card>}
            </>
          )}
        </div>

        <Dialog open={addLinkOpen} onOpenChange={(open) => { if (open) setAddLinkOpen(true); else closeAddLink(); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
              <DialogDescription>Save a resource to your library.</DialogDescription>
            </DialogHeader>
            <AddToolForm
              categories={categories}
              subCategories={subCategories}
              key={`${pathname}:${activeCategory?.id || ""}:${activeSubfolder?.id || ""}`}
              initialCategoryId={activeCategory?.id}
              initialSubCategoryId={activeSubfolder?.id}
              onSuccess={() => { closeAddLink(); fetchData(); confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } }); }}
              onCancel={closeAddLink}
              onRefreshCategories={async () => { const [catRes, subRes] = await Promise.all([fetch("/api/categories"), fetch("/api/sub-categories")]); if (catRes.ok) setCategories(await catRes.json()); if (subRes.ok) setSubCategories(await subRes.json()); }}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(deleteCandidate)}
          onOpenChange={(open) => {
            if (!open && !deleteLoading) {
              setDeleteCandidate(null);
              setDeleteError("");
            }
          }}
        >
          <DialogContent showCloseButton={!deleteLoading}>
            <DialogHeader>
              <DialogTitle>Delete this website?</DialogTitle>
              <DialogDescription>
                {deleteCandidate
                  ? `“${deleteCandidate.name}” will be permanently removed from your library.`
                  : "This website will be permanently removed from your library."}
              </DialogDescription>
            </DialogHeader>
            {deleteError && <Alert variant="destructive">{deleteError}</Alert>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={deleteLoading}
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" disabled={deleteLoading} onClick={confirmDelete}>
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete website
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(folderToDelete)} onOpenChange={(open) => { if (!open && !folderDeleting) setFolderToDelete(null); }}>
          <DialogContent showCloseButton={!folderDeleting}>
            <DialogHeader>
              <DialogTitle>Delete empty folder?</DialogTitle>
              <DialogDescription>“{folderToDelete?.name}” will be permanently deleted. Folders containing websites cannot be deleted.</DialogDescription>
            </DialogHeader>
            {folderDeleteError && <Alert variant="destructive">{folderDeleteError}</Alert>}
            <DialogFooter>
              <Button variant="outline" disabled={folderDeleting} onClick={() => setFolderToDelete(null)}>Cancel</Button>
              <Button variant="destructive" disabled={folderDeleting} onClick={confirmFolderDelete}>{folderDeleting && <Loader2 className="h-4 w-4 animate-spin" />}Delete folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={subfolderOpen && Boolean(activeCategory) && !subfolderId} onOpenChange={setSubfolderOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New sub-folder</DialogTitle><DialogDescription>Create a sub-folder inside {activeCategory?.name}.</DialogDescription></DialogHeader>
            <form onSubmit={handleAddSubfolder} className="space-y-4">
              {subfolderError && <Alert variant="destructive" className="text-xs">{subfolderError}</Alert>}
              <div className="space-y-2"><Label htmlFor="subfolder-name">Name</Label><Input id="subfolder-name" value={subfolderName} onChange={(event) => setSubfolderName(event.target.value)} placeholder="e.g. Component libraries" /></div>
              <Button type="submit" disabled={subfolderSaving} className="w-full">{subfolderSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create sub-folder"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Tool Dialog */}
        {editingTool && (
          <EditToolModal
            tool={editingTool}
            categories={categories}
            subCategories={subCategories}
            onClose={() => setEditingTool(null)}
            onSuccess={() => {
              setEditingTool(null);
              fetchData();
            }}
          />
        )}
      </div>
    </Shell>
  );
}
