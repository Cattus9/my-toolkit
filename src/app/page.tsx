"use client";

// Design Read: developer & designer toolkit index for software engineers and makers, with a Linear-style clean language, leaning toward Shadcn UI + Geist + restrained asymmetric grid.
// DIALS: DESIGN_VARIANCE: 6 | MOTION_INTENSITY: 4 | VISUAL_DENSITY: 4

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PixelBlast from "@/components/PixelBlast";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Tool } from "@/types/database";
import { Separator } from "@/components/ui/separator";
import { LogoLoop } from "@/components/LogoLoop";
import {
  ArrowRight,
  ExternalLink,
  Layers,
  Search,
  Tag,
  Globe,
  Plus,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";
interface LogoItem {
  name: string;
  logo_url: string;
  url?: string;
}


export default function Home() {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    async function fetchHeroData() {
      try {
        const [logosRes, toolsRes] = await Promise.all([
          fetch("/api/logos"),
          fetch("/api/tools")
        ]);
        if (logosRes.ok) {
          const data = await logosRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setLogos(data);
          }
        }
        if (toolsRes.ok) {
          const tData = await toolsRes.json();
          if (Array.isArray(tData) && tData.length > 0) {
            setTools(tData);
          }
        }
      } catch (err) {
        console.error("Failed to load hero data:", err);
      }
    }
    fetchHeroData();
  }, []);

  const defaultLogos: LogoItem[] = [
    { name: "Next.js", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=nextjs.org" },
    { name: "React", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=react.dev" },
    { name: "TypeScript", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=typescriptlang.org" },
    { name: "Tailwind CSS", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=tailwindcss.com" },
    { name: "Supabase", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=supabase.com" },
    { name: "GitHub", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=github.com" },
    { name: "Vercel", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=vercel.com" },
    { name: "Figma", logo_url: "https://www.google.com/s2/favicons?sz=64&domain=figma.com" },
  ];

  const displayedLogos = useMemo(() => {
    const source = logos.length > 0 ? logos : defaultLogos;
    const uniqueByIcon = new Map<string, LogoItem & { iconKey: string }>();
    for (const item of source) {
      let key = item.logo_url;
      try {
        const icon = new URL(item.logo_url, "https://icons.invalid");
        icon.searchParams.delete("sz");
        icon.searchParams.delete("size");
        key = icon.toString();
      } catch {
        key = item.logo_url.trim().toLowerCase();
      }
      if (!uniqueByIcon.has(key)) uniqueByIcon.set(key, { ...item, iconKey: key });
    }
    const unique = Array.from(uniqueByIcon.values());
    const selected = unique.slice(0, 12);
    if (unique.length > 1) {
      while (selected.length < 12) {
        const previous = selected[selected.length - 1];
        const isLast = selected.length === 11;
        const desired = unique[selected.length % unique.length];
        const next = desired.iconKey !== previous.iconKey && (!isLast || desired.iconKey !== selected[0].iconKey)
          ? desired
          : unique.find((item) => item.iconKey !== previous.iconKey && (!isLast || item.iconKey !== selected[0].iconKey));
        if (!next) break;
        selected.push(next);
      }
    }
    return selected.map((item) => ({ src: item.logo_url, alt: item.name, title: item.name, href: item.url }));
  }, [logos]);

  return (
    <Shell>
      {/* 1. Hero Section - Full Viewport with Interactive PixelBlast Background */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 md:py-24 overflow-hidden">
        {/* Background PixelBlast Canvas */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-auto">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#818CF8"
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent
            edgeFade={0.25}
            className="w-full h-full opacity-55"
          />
          {/* Scrim overlays to protect text readability and eliminate lost focus */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:w-2/3 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_25%_40%,rgba(15,23,42,0.85)_0%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 pointer-events-auto">
              <Badge variant="outline" className="px-3 py-1 text-xs font-mono bg-background/90 backdrop-blur-md border-border text-foreground shadow-xs gap-1.5 w-fit">
                <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                <span>Personal & Team Resource Vault</span>
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-[1.1] drop-shadow-xs">
                Your tools, neatly organized.
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-[54ch] drop-shadow-xs">
                Save tools and design references. Find them fast.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/dashboard">
                  <Button size="default" className="gap-2 font-medium cursor-pointer shadow-md">
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard?add=true">
                  <Button variant="outline" size="default" className="gap-2 bg-background/90 backdrop-blur-md border-border text-foreground hover:bg-muted hover:text-foreground cursor-pointer shadow-xs">
                    <Plus className="h-4 w-4" />
                    <span>Submit Resource</span>
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/70 text-slate-300 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Metadata sync</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/70 text-slate-300 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Sub-category tags</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/70 text-slate-300 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Instant filters</span>
                </div>
              </div>
            </div>

            {/* Right Side-Hero Column: Interactive MagicUI Terminal */}
            <div className="lg:col-span-5 pointer-events-auto flex items-center justify-center w-full">
              <Terminal className="w-full border-border/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                <TypingAnimation delay={200} duration={35} className="font-mono text-xs text-primary font-semibold">
                  &gt; my tool kit sync --vault-active
                </TypingAnimation>

                <AnimatedSpan delay={250} className="text-muted-foreground font-mono text-xs">
                  <span>Connecting to Supabase registry...</span>
                </AnimatedSpan>

                <AnimatedSpan delay={300} className="text-emerald-400 font-mono text-xs font-medium">
                  <span>✔ Connection live. Cataloging {tools.length || 6} registered tools:</span>
                </AnimatedSpan>

                {(tools.length > 0
                  ? tools
                  : [
                      { id: "1", name: "Next.js", url: "https://nextjs.org", categories: { name: "Frontend & Web" } },
                      { id: "2", name: "Tailwind CSS", url: "https://tailwindcss.com", categories: { name: "Frontend & Web" } },
                      { id: "3", name: "Supabase", url: "https://supabase.com", categories: { name: "Database & Cache" } },
                      { id: "4", name: "Shadcn UI", url: "https://ui.shadcn.com", categories: { name: "UI & Components" } },
                      { id: "5", name: "Lucide Icons", url: "https://lucide.dev", categories: { name: "Iconography" } },
                      { id: "6", name: "Vercel", url: "https://vercel.com", categories: { name: "DevOps & Cloud" } },
                    ]
                ).map((item, idx) => (
                  <AnimatedSpan
                    key={item.id || idx}
                    delay={180 + idx * 40}
                    className="font-mono text-[11px] sm:text-xs py-0.5 border-b border-border/20 last:border-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-primary font-bold text-[10px]">●</span>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground text-[10px] sm:text-[11px] truncate opacity-70">
                          {item.url.replace(/^https?:\/\//, "")}
                        </span>
                      </span>
                      <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        {item.categories?.name || "Ready"}
                      </span>
                    </div>
                  </AnimatedSpan>
                ))}

                <AnimatedSpan delay={350} className="text-blue-400 font-mono text-xs pt-1.5 flex items-center justify-between">
                  <span>ℹ Auto-OG metadata synchronized</span>
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    200 OK
                  </span>
                </AnimatedSpan>

                <TypingAnimation delay={450} duration={25} className="text-muted-foreground font-mono text-xs pt-1">
                  Vault status: All library links operational.
                </TypingAnimation>
              </Terminal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tool icon marquee */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mx-[clamp(24px,4vw,60px)]">
            <LogoLoop
              logos={displayedLogos}
              speed={42}
              maxVisible={16}
              gap={36}
              fadeOut
              scaleOnHover
              ariaLabel="Registered tools and integrations"
            />
          </div>
        </div>
      </section>


      {/* 3. Bento Grid Features - Asymmetric Rhythm */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for how engineers actually discover tools.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              No endless bookmark folders that rot. Clear classification, automatic previews, and fast retrieval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento Card 1: 7-col wide */}
            <Card className="md:col-span-7 border border-border/70 bg-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Automated OpenGraph & Favicon Extraction
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[50ch]">
                  Just paste any destination URL. The backend automatically extracts metadata, site banners, and official favicon assets in real time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-xs font-mono text-muted-foreground">
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                  <span className="block text-[10px] uppercase text-muted-foreground/60 mb-0.5">Scraper</span>
                  <span className="text-foreground font-medium">OG + Twitter meta</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                  <span className="block text-[10px] uppercase text-muted-foreground/60 mb-0.5">Asset Service</span>
                  <span className="text-foreground font-medium">Domain Favicon cache</span>
                </div>
              </div>
            </Card>

            {/* Bento Card 2: 5-col narrow */}
            <Card className="md:col-span-5 border border-border/70 bg-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Tag className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Hierarchical Tags & Categories
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Group by high-level domains like UI, Backend, or Testing, then drill down into sub-categories.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">Frontend</Badge>
                <Badge variant="outline" className="text-xs">React</Badge>
                <Badge variant="secondary" className="text-xs">State</Badge>
                <Badge variant="outline" className="text-xs">Zustand</Badge>
                <Badge variant="secondary" className="text-xs">Database</Badge>
                <Badge variant="outline" className="text-xs">Postgres</Badge>
              </div>
            </Card>

            {/* Bento Card 3: 5-col narrow */}
            <Card className="md:col-span-5 border border-border/70 bg-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Search className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Sub-millisecond Search
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Search across tool names, notes, and hosts without waiting for server roundtrips.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <div className="pl-8 pr-3 py-1.5 rounded-md border border-border/60 bg-muted/20 text-xs font-mono text-muted-foreground">
                    lucide | shadcn | supabase
                  </div>
                </div>
              </div>
            </Card>

            {/* Bento Card 4: 7-col wide */}
            <Card className="md:col-span-7 border border-border/70 bg-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Supabase Powered Persistence
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[50ch]">
                  Backed by PostgreSQL with Row Level Security options and real-time updates. Your collection stays accessible everywhere.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Relational joins • Foreign keys</span>
                <span className="text-primary font-semibold">PostgreSQL 16</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Bottom Action Banner */}
      <section className="py-16 border-t border-border/50 bg-muted/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Start organizing your development stash today.
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Stop pasting URLs into browser bookmark chaos. Put everything in a searchable, curated repository.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="default" className="gap-2 font-medium cursor-pointer shadow-sm">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
