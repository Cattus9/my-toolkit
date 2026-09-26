"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, FolderOpen, Tag, Image as ImageIcon, Globe } from "lucide-react";
import type { Tool, Category, SubCategory } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EditToolModalProps {
  tool: Tool;
  categories: Category[];
  subCategories: SubCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EditToolModal({
  tool,
  categories,
  subCategories,
  onClose,
  onSuccess,
}: EditToolModalProps) {
  const [name, setName] = useState(tool.name);
  const [url, setUrl] = useState(tool.url);
  const [description, setDescription] = useState(tool.description || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(tool.category_id);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(tool.sub_category_id || "");
  const [logoUrl, setLogoUrl] = useState(tool.logo_url || "");
  const [imageUrl, setImageUrl] = useState(tool.image_url || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category_id === selectedCategoryId
  );

  useEffect(() => {
    const isValid = filteredSubCategories.some((sub) => sub.id === selectedSubCategoryId);
    if (!isValid && selectedSubCategoryId !== "") {
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId, filteredSubCategories, selectedSubCategoryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !url || !selectedCategoryId) {
      setError("Please fill in Name, URL, and Category");
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tool.id,
          name: name.trim(),
          url: sanitizedUrl,
          description: description.trim(),
          category_id: selectedCategoryId,
          sub_category_id: selectedSubCategoryId || null,
          logo_url: logoUrl.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update tool");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-border/80 sm:rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-base font-semibold tracking-tight">Edit Resource</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Modify details, tags, or visual preview endpoints.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-url" className="text-xs font-medium">
                  URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-[64px] resize-none"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Category <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategoryId === cat.id ? "default" : "outline"}
                    className="cursor-pointer text-xs font-normal py-0.5 px-2 transition-all select-none hover:border-primary/50"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubCategoryId("");
                    }}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Subcategory selection */}
            {selectedCategoryId && filteredSubCategories.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Sub-category
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={selectedSubCategoryId === "" ? "secondary" : "outline"}
                    className="cursor-pointer text-xs font-normal py-0.5 px-2 transition-all select-none"
                    onClick={() => setSelectedSubCategoryId("")}
                  >
                    None
                  </Badge>
                  {filteredSubCategories.map((sub) => (
                    <Badge
                      key={sub.id}
                      variant={selectedSubCategoryId === sub.id ? "default" : "outline"}
                      className="cursor-pointer text-xs font-normal py-0.5 px-2 transition-all select-none"
                      onClick={() => setSelectedSubCategoryId(sub.id)}
                    >
                      {sub.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2 border-t border-border/40">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Visual Assets (Optional)
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-logo" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />
                    Favicon / Logo URL
                  </Label>
                  <Input
                    id="edit-logo"
                    placeholder="https://.../logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-image" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" />
                    Preview Image URL
                  </Label>
                  <Input
                    id="edit-image"
                    placeholder="https://.../preview.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border/50 bg-muted/10 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !name || !url || !selectedCategoryId}
              className="cursor-pointer text-xs h-8 gap-1.5 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
