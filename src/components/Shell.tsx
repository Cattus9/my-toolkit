"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, Compass, House, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Shell({ children }: LayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:border-primary/40 group-hover:bg-primary/15 transition-all">
                <BookmarkCheck className="h-4 w-4" />
              </div>
              <span className="font-semibold tracking-tight text-base text-foreground group-hover:text-primary transition-colors">
                my tool kit
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono py-0 px-1.5 h-4 text-muted-foreground border-border/70">
                v1.0
              </Badge>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-border/50">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === "/"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <House className="h-3.5 w-3.5" />
                Home
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isDashboard
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                Explore
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isDashboard ? (
              <Link href="/dashboard?add=true">
                <Button size="sm" className="gap-1.5 font-medium shadow-sm cursor-pointer">
                  <Plus className="h-4 w-4" />
                  <span>Add Tool</span>
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-mono">
            <span>my tool kit</span>
            <span>•</span>
            <span>Curated Developer & Designer Stack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard?add=true" className="hover:text-foreground transition-colors">
              Submit Tool
            </Link>
            <span className="font-mono text-muted-foreground/60">
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
