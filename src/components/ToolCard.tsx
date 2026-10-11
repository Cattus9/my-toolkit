"use client";

import { useState } from "react";
import { ExternalLink, Trash2, Globe, MoreVertical, Edit3, ImageOff } from "lucide-react";
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

function WebsitePreview({ url, imageUrl, name }: { url: string; imageUrl: string | null; name: string }) {
  const screenshotUrl = `https://image.thum.io/get/width/1200/crop/675/noanimate/${encodeURIComponent(url)}`;
  const [source, setSource] = useState(imageUrl || screenshotUrl);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  return <>
    {status !== "unavailable" && (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img key={source} src={source} alt={`${name} preview`} className={`object-cover w-full h-full transition-opacity ${status === "ready" ? "opacity-100 group-hover:scale-105" : "opacity-0"}`} onLoad={() => setStatus("ready")} onError={() => {
        if (source !== screenshotUrl) {
          setStatus("loading");
          setSource(screenshotUrl);
        } else setStatus("unavailable");
      }} />
    )}
    {status !== "ready" && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center bg-muted/30">
      <ImageOff aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs font-medium text-foreground">{status === "loading" ? "Loading preview…" : "Preview unavailable"}</p>
      <p className="text-[10px] text-muted-foreground">{status === "loading" ? "Fetching website appearance" : "You can still visit this website"}</p>
    </div>}
  </>;
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
    <Card className="group flex flex-col justify-between overflow-hidden border border-border/70 bg-card p-0 hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div>
        {/* Visual Preview Banner */}
        <div className="relative aspect-video w-full bg-muted/50 border-b border-border/50 overflow-hidden flex items-center justify-center">
          <WebsitePreview key={`${tool.url}:${tool.image_url}`} url={tool.url} imageUrl={tool.image_url} name={tool.name} />

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start gap-2.5">
            {tool.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                className="w-4 h-4 rounded object-contain bg-white dark:bg-zinc-800 p-0.5 border border-border/80 shrink-0 mt-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`logo-fallback ${tool.logo_url ? "hidden" : ""} shrink-0 mt-0.5`}>
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate">
                {tool.name}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground truncate">
                {domain}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {tool.description || "No description provided."}
          </p>

          {/* Category badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tool.categories?.name && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                {tool.categories.name}
              </Badge>
            )}
            {tool.sub_categories?.name && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/80"
              >
                {tool.sub_categories.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </div>

      {/* Card Action Footer */}
      <CardFooter className="px-3 py-2 border-t border-border/50 bg-muted/15 flex items-center justify-between">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span>Visit site</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => onEdit(tool)}
            title="Edit"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => onDelete(tool.id)}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
