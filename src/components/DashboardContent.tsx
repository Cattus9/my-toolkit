"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { ToolCard } from "@/components/ToolCard";
import { AddToolForm } from "@/components/AddToolForm";
import { EditToolModal } from "@/components/EditToolModal";
import type { Tool, Category, SubCategory } from "@/types/database";
import {
  Plus, Search, Tag, FilterX, BookmarkCheck, Layers, Sparkles, Loader2, FolderOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAddingParam = searchParams.get("add") === "true";

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [addLinkOpen, setAddLinkOpen] = useState(isAddingParam);
  const [subfolderOpen, setSubfolderOpen] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [subfolderCategory, setSubfolderCategory] = useState("");
  const [subfolderSaving, setSubfolderSaving] = useState(false);
  const [subfolderError, setSubfolderError] = useState("");

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
    if (!subfolderName.trim() || !subfolderCategory) return;
    setSubfolderSaving(true);
    setSubfolderError("");
    try {
      const response = await fetch("/api/sub-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: subfolderName.trim(), category_id: subfolderCategory }) });
      if (!response.ok) throw new Error((await response.json()).error || "Could not create sub-folder");
      setSubfolderName(""); setSubfolderCategory(""); setSubfolderOpen(false); await fetchData();
    } catch (error) { setSubfolderError(error instanceof Error ? error.message : "Could not create sub-folder"); }
    finally { setSubfolderSaving(false); }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`/api/tools?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting tool:", err);
    }
  }

  const filteredTools = tools.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      (tool.description && tool.description.toLowerCase().includes(q)) ||
      tool.url.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" || tool.category_id === selectedCategory;

    const matchesSubCategory =
      selectedSubCategory === "all" || tool.sub_category_id === selectedSubCategory;

    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const availableSubCategories = subCategories.filter(
    (sub) => selectedCategory === "all" || sub.category_id === selectedCategory
  );

  const isFiltered =
    searchQuery !== "" || selectedCategory !== "all" || selectedSubCategory !== "all";

  return (
    <Shell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* Top Header & Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Resource Library
              </h1>
              <Badge variant="secondary" className="font-mono text-[11px] h-5 px-2">
                {tools.length} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Curate, filter, and access your developer toolkit and design references.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setSubfolderOpen(true)} variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <Layers className="h-4 w-4" />
              <span>New sub-folder</span>
            </Button>
            <Button onClick={() => { setAddLinkOpen(true); router.replace("/dashboard"); }} size="sm" className="gap-1.5 text-xs font-medium">
              <Plus className="h-4 w-4" />
              <span>Add Link</span>
            </Button>
          </div>
        </div>

        <div className="pt-6 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/60">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, description, or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background/50"
                />
              </div>

              {/* Category Pills Slider / Filter */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="h-9 shrink-0 cursor-pointer rounded-md px-3 py-0 text-xs transition-all select-none hover:border-primary/50"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubCategory("all");
                  }}
                >
                  All ({tools.length})
                </Badge>
                {categories.map((cat) => {
                  const count = tools.filter((t) => t.category_id === cat.id).length;
                  return (
                    <Badge
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      className="h-9 shrink-0 cursor-pointer rounded-md px-3 py-0 text-xs transition-all select-none hover:border-primary/50"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory("all");
                      }}
                    >
                      {cat.name} ({count})
                    </Badge>
                  );
                })}

                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedSubCategory("all");
                    }}
                  >
                    <FilterX className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Sub-category pills if available */}
            {selectedCategory !== "all" && availableSubCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pl-1">
                <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Subcategory:
                </span>
                <Badge
                  variant={selectedSubCategory === "all" ? "secondary" : "outline"}
                  className="cursor-pointer text-[11px] py-0.5 px-2 select-none"
                  onClick={() => setSelectedSubCategory("all")}
                >
                  All subcategories
                </Badge>
                {availableSubCategories.map((sub) => (
                  <Badge
                    key={sub.id}
                    variant={selectedSubCategory === sub.id ? "default" : "outline"}
                    className="cursor-pointer text-[11px] py-0.5 px-2 select-none"
                    onClick={() => setSelectedSubCategory(sub.id)}
                  >
                    {sub.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-border/60">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <div className="flex gap-1.5 pt-2">
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 w-12 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="space-y-10">
                {/* When 'All' is selected, group cleanly by category */}
                {selectedCategory === "all" && !searchQuery ? (
                  categories.map((cat) => {
                    const catTools = filteredTools.filter((t) => t.category_id === cat.id);
                    if (catTools.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-foreground">
                              {cat.name}
                            </h2>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                              {catTools.length}
                            </Badge>
                          </div>
                          <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {catTools.map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onDelete={handleDelete}
                              onEdit={(t) => setEditingTool(t)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onDelete={handleDelete}
                        onEdit={(t) => setEditingTool(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <Card className="border-dashed border-border/80 p-12 text-center bg-card/40">
                <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      No resources found
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {isFiltered
                        ? "No bookmarks match the current query or filters. Try clearing your filters."
                        : "Your toolkit is empty. Start by adding your first web resource or documentation link."}
                    </p>
                  </div>
                  <div className="pt-2">
                    {isFiltered ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setSelectedSubCategory("all");
                        }}
                        className="text-xs cursor-pointer"
                      >
                        Reset Filters
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => router.push("/dashboard?add=true")}
                        className="text-xs cursor-pointer gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add First Resource</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        <Dialog open={addLinkOpen} onOpenChange={(open) => { setAddLinkOpen(open); if (!open) router.replace("/dashboard"); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
              <DialogDescription>Save a resource to your library.</DialogDescription>
            </DialogHeader>
            <AddToolForm
              categories={categories}
              subCategories={subCategories}
              onSuccess={() => { setAddLinkOpen(false); fetchData(); confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } }); }}
              onCancel={() => setAddLinkOpen(false)}
              onRefreshCategories={async () => { const [catRes, subRes] = await Promise.all([fetch("/api/categories"), fetch("/api/sub-categories")]); if (catRes.ok) setCategories(await catRes.json()); if (subRes.ok) setSubCategories(await subRes.json()); }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={subfolderOpen} onOpenChange={setSubfolderOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New sub-folder</DialogTitle><DialogDescription>Add a sub-category under an existing category.</DialogDescription></DialogHeader>
            <form onSubmit={handleAddSubfolder} className="space-y-4">
              {subfolderError && <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{subfolderError}</p>}
              <div className="space-y-2"><Label htmlFor="subfolder-name">Name</Label><Input id="subfolder-name" value={subfolderName} onChange={(event) => setSubfolderName(event.target.value)} placeholder="e.g. Component libraries" required /></div>
              <div className="space-y-2"><Label htmlFor="subfolder-category">Category</Label><select id="subfolder-category" value={subfolderCategory} onChange={(event) => setSubfolderCategory(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <Button type="submit" disabled={subfolderSaving || !subfolderName.trim() || !subfolderCategory} className="w-full">{subfolderSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create sub-folder"}</Button>
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
