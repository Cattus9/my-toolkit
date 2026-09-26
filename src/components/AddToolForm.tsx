"use client";

import { useState } from "react";
import { Plus, X, Loader2, Sparkles, FolderPlus, Tag } from "lucide-react";
import type { Category, SubCategory } from "@/types/database";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AddToolFormProps {
  categories: Category[];
  subCategories: SubCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  onRefreshCategories: () => Promise<void>;
}

export function AddToolForm({
  categories,
  subCategories,
  onSuccess,
  onCancel,
  onRefreshCategories,
}: AddToolFormProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category_id === selectedCategoryId
  );

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to create category");
      }
      const data = await response.json();
      await onRefreshCategories();
      setSelectedCategoryId(data.id);
      setIsAddingCategory(false);
      setNewCategoryName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSubCategory() {
    if (!newSubCategoryName.trim() || !selectedCategoryId) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubCategoryName.trim(),
          category_id: selectedCategoryId,
        }),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to create subcategory");
      }
      const data = await response.json();
      await onRefreshCategories();
      setSelectedSubCategoryId(data.id);
      setIsAddingSubCategory(false);
      setNewSubCategoryName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !selectedCategoryId) {
      setError("Enter a name and URL, then choose a category.");
      return;
    }

    let sanitizedUrl = url.trim();
    if (sanitizedUrl && !/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          url: sanitizedUrl,
          description: description.trim(),
          category_id: selectedCategoryId,
          sub_category_id: selectedSubCategoryId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create tool");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border border-border/80 shadow-sm bg-card">
      <CardHeader className="pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight">Add New Resource</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Metadata, preview cards, and favicon will automatically sync.
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-5">
          {error && <Alert variant="destructive" className="text-xs">{error}</Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tool-name" className="text-xs font-medium text-foreground">
                Tool Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tool-name"
                placeholder="e.g. Radix UI, v0.dev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tool-url" className="text-xs font-medium text-foreground">
                Website URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tool-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tool-description" className="text-xs font-medium text-foreground">
              Description <span className="text-muted-foreground text-[11px] font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="tool-description"
              placeholder="Short note about what this tool does or why you saved it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[72px] resize-none"
            />
          </div>

          {/* Category selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
                Category <span className="text-destructive">*</span>
              </Label>
              {!isAddingCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-1.5"
                  onClick={() => setIsAddingCategory(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New category
                </Button>
              )}
            </div>

            {isAddingCategory ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-border bg-muted/20">
                <Input
                  placeholder="Category title..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs cursor-pointer"
                  onClick={handleAddCategory}
                  disabled={loading || !newCategoryName.trim()}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={() => setIsAddingCategory(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={selectedCategoryId === cat.id ? "default" : "outline"}
                    size="sm"
                    className="h-8 rounded-md px-3 text-xs font-medium transition-colors"
                    aria-pressed={selectedCategoryId === cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubCategoryId("");
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground">No categories yet. Click New category above.</p>
                )}
              </div>
            )}
          </div>

          {/* Sub-category selection */}
          {selectedCategoryId && (
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Sub-category <span className="text-muted-foreground text-[11px] font-normal">(Optional)</span>
                </Label>
                {!isAddingSubCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-1.5"
                    onClick={() => setIsAddingSubCategory(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New subcategory
                  </Button>
                )}
              </div>

              {isAddingSubCategory ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-border bg-muted/20">
                  <Input
                    placeholder="Subcategory title..."
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={handleAddSubCategory}
                    disabled={loading || !newSubCategoryName.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => setIsAddingSubCategory(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant={selectedSubCategoryId === "" ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 rounded-md px-3 text-xs font-medium"
                    aria-pressed={selectedSubCategoryId === ""}
                    onClick={() => setSelectedSubCategoryId("")}
                  >
                    None
                  </Button>
                  {filteredSubCategories.map((sub) => (
                    <Button
                      key={sub.id}
                      type="button"
                      variant={selectedSubCategoryId === sub.id ? "default" : "outline"}
                      size="sm"
                      className="h-8 rounded-md px-3 text-xs font-medium"
                      aria-pressed={selectedSubCategoryId === sub.id}
                      onClick={() => setSelectedSubCategoryId(sub.id)}
                    >
                      {sub.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2.5 pt-4 pb-4 px-6 border-t border-border/50 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="cursor-pointer text-xs h-8 gap-1.5 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving tool...</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Save Resource</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
