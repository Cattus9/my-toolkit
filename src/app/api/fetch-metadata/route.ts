import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ image: null, logo: null });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Formulate standard default logo and high-res web hero screenshot
    const fallbackLogo = `https://www.google.com/s2/favicons?sz=64&domain=${parsedUrl.hostname}`;
    const fallbackScreenshot = `https://image.thum.io/get/width/1200/crop/675/noanimate/${encodeURIComponent(parsedUrl.toString())}`;

    if (!response.ok) {
      return NextResponse.json({
        image: fallbackScreenshot,
        logo: fallbackLogo,
      });
    }

    const html = await response.text();

    // Regexes for images
    const ogImageRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const ogImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i;
    const twitterImageRegex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const twitterImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i;
    const shortcutIconRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i;

    // Regexes for logos/favicons specifically
    const iconRegex = /<link[^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;

    let imageUrl = "";

    // 1. Try OG image
    let match = html.match(ogImageRegex) || html.match(ogImageRegexAlt);
    if (match && match[1]) {
      imageUrl = match[1];
    }

    // 2. Try Twitter image
    if (!imageUrl) {
      match = html.match(twitterImageRegex) || html.match(twitterImageRegexAlt);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }

    // Resolve imageUrl helper
    if (imageUrl) {
      if (imageUrl.startsWith("//")) {
        imageUrl = `${parsedUrl.protocol}${imageUrl}`;
      } else if (imageUrl.startsWith("/")) {
        imageUrl = `${parsedUrl.origin}${imageUrl}`;
      } else if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        imageUrl = `${parsedUrl.origin}/${imageUrl}`;
      }
    } else {
      // Fallback to real web hero screenshot of the link
      imageUrl = fallbackScreenshot;
    }

    // Now find the best logo / icon URL
    let logoUrl = "";
    let iconMatch;
    const iconCandidates: string[] = [];

    // Find all matching icon links
    while ((iconMatch = iconRegex.exec(html)) !== null) {
      if (iconMatch[1]) {
        iconCandidates.push(iconMatch[1]);
      }
    }

    // Sort iconCandidates to prioritize apple-touch-icon (often higher res) or files containing 'apple' or larger size specifications
    if (iconCandidates.length > 0) {
      // Pick first match as simple default
      logoUrl = iconCandidates[0];
      // If we have one with apple-touch-icon, use that instead
      const appleIcon = iconCandidates.find(c => c.toLowerCase().includes("apple"));
      if (appleIcon) {
        logoUrl = appleIcon;
      }
    }

    // Resolve relative path for logoUrl
    if (logoUrl) {
      if (logoUrl.startsWith("//")) {
        logoUrl = `${parsedUrl.protocol}${logoUrl}`;
      } else if (logoUrl.startsWith("/")) {
        logoUrl = `${parsedUrl.origin}${logoUrl}`;
      } else if (!logoUrl.startsWith("http://") && !logoUrl.startsWith("https://")) {
        logoUrl = `${parsedUrl.origin}/${logoUrl}`;
      }
    } else {
      logoUrl = fallbackLogo;
    }

    return NextResponse.json({ image: imageUrl, logo: logoUrl });

  } catch (err) {
    console.error("Error fetching web page metadata:", err);
    const parsed = new URL(targetUrl);
    return NextResponse.json({ 
      image: null,
      logo: `https://www.google.com/s2/favicons?sz=64&domain=${parsed.hostname}`
    });
  }
}
