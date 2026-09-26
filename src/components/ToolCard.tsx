"use client";

import { ExternalLink, Trash2, Globe, MoreVertical, Edit3 } from "lucide-react";
import type { Tool } from "@/types/database";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ToolCardProps {
  tool: Tool;
  onDelete: (id: string) => void;
  onEdit: (tool: Tool) => void;
}

export function ToolCard({ tool, onDelete, onEdit }: ToolCardProps) {
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return tool.url;
    }
  })();

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div>
        {/* Visual Preview Banner */}
        <div className="relative aspect-video w-full bg-muted/50 border-b border-border/50 overflow-hidden flex items-center justify-center">
          {tool.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tool.image_url}
              alt={tool.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                if (!e.currentTarget.src.includes("image.thum.io") && tool.url) {
                  e.currentTarget.src = `https://image.thum.io/get/width/1200/crop/675/noanimate/${encodeURIComponent(tool.url)}`;
                } else {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector(".fallback-placeholder");
                    if (placeholder) {
                      placeholder.classList.remove("hidden");
                    }
                  }
                }
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`https://image.thum.io/get/width/1200/crop/675/noanimate/${encodeURIComponent(tool.url)}`}
              alt={tool.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector(".fallback-placeholder");
                  if (placeholder) {
                    placeholder.classList.remove("hidden");
                  }
                }
              }}
            />
          )}

          {/* Fallback layout */}
          <div
            className="fallback-placeholder hidden absolute inset-0 flex flex-col items-center justify-center p-6 bg-muted/30"
          >
            <Globe className="h-8 w-8 text-muted-foreground/40 mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-mono text-muted-foreground bg-background/80 px-2.5 py-0.5 rounded-md border border-border/80">
              {domain}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    className="h-7 w-7 rounded-md bg-background/90 backdrop-blur-sm border border-border shadow-xs hover:bg-background cursor-pointer p-0 flex items-center justify-center"
                    aria-label="Tool options"
                  />
                }
              >
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs">
                <DropdownMenuItem onClick={() => onEdit(tool)} className="cursor-pointer gap-2">
                  <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(tool.id)}
                  className="cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card Main Info */}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            {tool.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                className="w-5 h-5 rounded object-contain bg-white dark:bg-zinc-800 p-0.5 border border-border/80 shrink-0 mt-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`logo-fallback ${tool.logo_url ? "hidden" : ""} shrink-0 mt-0.5`}>
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {tool.name}
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground truncate">
                {domain}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {tool.description || "No description provided."}
          </p>

          {/* Category badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tool.categories?.name && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-normal">
                {tool.categories.name}
              </Badge>
            )}
            {tool.sub_categories?.name && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 font-normal text-muted-foreground border-border/80"
              >
                {tool.sub_categories.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </div>

      {/* Card Action Footer */}
      <CardFooter className="px-4 py-3 border-t border-border/50 bg-muted/15 flex items-center justify-between">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span>Visit site</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => onEdit(tool)}
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => onDelete(tool.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
