import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const env = loadEnv([".env.example", ".env", ".env.local"]);
const port = Number(process.env.MOCK_API_PORT || env.MOCK_API_PORT || 8787);

const unsplashAccessKey =
  process.env.UNSPLASH_ACCESS_KEY ||
  env.UNSPLASH_ACCESS_KEY ||
  env.LEGACY_UNSPLASH_ACCESS_KEY ||
  "";

const googleFontsApiKey =
  process.env.GOOGLE_FONTS_API_KEY ||
  env.GOOGLE_FONTS_API_KEY ||
  env.LEGACY_GOOGLE_FONTS_API_KEY ||
  "";

const colorApiBaseUrl =
  process.env.COLOR_API_BASE_URL ||
  env.COLOR_API_BASE_URL ||
  "https://www.thecolorapi.com";

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url || "/", `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && requestUrl.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        services: {
          unsplash: hasRealKey(unsplashAccessKey),
          googleFonts: hasRealKey(googleFontsApiKey),
          colorApi: true,
        },
      });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/images/search") {
      const query = requestUrl.searchParams.get("q") || requestUrl.searchParams.get("query") || "design";
      const images = await searchUnsplash(query);
      sendJson(res, 200, { query, images });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/fonts") {
      const limit = Number(requestUrl.searchParams.get("limit") || 40);
      const fonts = await listGoogleFonts(limit);
      sendJson(res, 200, { fonts });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/colors/palette") {
      const hex = sanitizeHex(requestUrl.searchParams.get("hex") || "454fda");
      const mode = requestUrl.searchParams.get("mode") || "analogic";
      const count = clamp(Number(requestUrl.searchParams.get("count") || 6), 3, 12);
      const palette = await getColorPalette(hex, mode, count);
      sendJson(res, 200, { hex, mode, palette });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: "Mock API request failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(port, () => {
  console.log(`Mock API server listening on http://localhost:${port}`);
});

async function searchUnsplash(query) {
  if (!hasRealKey(unsplashAccessKey)) {
    return fallbackImages(query);
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "8");
  url.searchParams.set("orientation", "landscape");

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${unsplashAccessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!response.ok) {
    return fallbackImages(query);
  }

  const data = await response.json();

  return (data.results || []).map((item) => ({
    id: item.id,
    alt: item.alt_description || item.description || query,
    thumb: item.urls?.thumb,
    regular: item.urls?.regular,
    author: item.user?.name,
    link: item.links?.html,
  }));
}

async function listGoogleFonts(limit) {
  if (!hasRealKey(googleFontsApiKey)) {
    return fallbackFonts().slice(0, limit);
  }

  const url = new URL("https://www.googleapis.com/webfonts/v1/webfonts");
  url.searchParams.set("key", googleFontsApiKey);
  url.searchParams.set("sort", "popularity");

  const response = await fetch(url);

  if (!response.ok) {
    return fallbackFonts().slice(0, limit);
  }

  const data = await response.json();

  return (data.items || []).slice(0, limit).map((font) => ({
    family: font.family,
    category: font.category,
    variants: font.variants,
  }));
}

async function getColorPalette(hex, mode, count) {
  const url = new URL("/scheme", colorApiBaseUrl);
  url.searchParams.set("hex", hex);
  url.searchParams.set("mode", mode);
  url.searchParams.set("count", String(count));

  const response = await fetch(url);

  if (!response.ok) {
    return fallbackPalette(hex);
  }

  const data = await response.json();

  return (data.colors || []).map((color) => ({
    hex: color.hex?.value,
    name: color.name?.value,
  }));
}

function fallbackImages(query) {
  const label = encodeURIComponent(query);

  return [
    {
      id: "demo-forest",
      alt: `${query} forest`,
      thumb: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=240&q=60&demo=${label}`,
      regular: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      author: "Demo image",
      link: "https://unsplash.com",
    },
    {
      id: "demo-desk",
      alt: `${query} desk`,
      thumb: `https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=240&q=60&demo=${label}`,
      regular: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      author: "Demo image",
      link: "https://unsplash.com",
    },
    {
      id: "demo-city",
      alt: `${query} city`,
      thumb: `https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=240&q=60&demo=${label}`,
      regular: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      author: "Demo image",
      link: "https://unsplash.com",
    },
  ];
}

function fallbackFonts() {
  return [
    { family: "Inter", category: "sans-serif", variants: ["regular", "500", "700"] },
    { family: "Roboto", category: "sans-serif", variants: ["regular", "500", "700"] },
    { family: "Montserrat", category: "sans-serif", variants: ["regular", "600", "700"] },
    { family: "Playfair Display", category: "serif", variants: ["regular", "700"] },
    { family: "Merriweather", category: "serif", variants: ["regular", "700"] },
    { family: "Poppins", category: "sans-serif", variants: ["regular", "600", "700"] },
    { family: "Oswald", category: "sans-serif", variants: ["regular", "500", "700"] },
    { family: "Lora", category: "serif", variants: ["regular", "700"] },
  ];
}

function fallbackPalette(hex) {
  return [
    { hex: `#${hex}`, name: "Selected" },
    { hex: "#0f0f14", name: "Ink" },
    { hex: "#e5e5e7", name: "Mist" },
    { hex: "#ef4444", name: "Signal" },
    { hex: "#22c55e", name: "Fresh" },
    { hex: "#f59e0b", name: "Amber" },
  ];
}

function loadEnv(files) {
  const values = {};

  for (const file of files) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;

    const content = readFileSync(path, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const equalsIndex = line.indexOf("=");
      if (equalsIndex > -1) {
        const key = line.slice(0, equalsIndex).trim();
        const value = line.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");
        values[key] = value;
        continue;
      }

      const [legacyValue] = line.split(/\s+-\s+/);
      if (line.toLowerCase().includes("google fonts")) {
        values.LEGACY_GOOGLE_FONTS_API_KEY = legacyValue.trim();
      }
      if (line.toLowerCase().includes("unsplashed public") || line.toLowerCase().includes("unsplash public")) {
        values.LEGACY_UNSPLASH_ACCESS_KEY = legacyValue.trim();
      }
    }
  }

  return values;
}

function sanitizeHex(hex) {
  return hex.replace("#", "").replace(/[^a-fA-F0-9]/g, "").slice(0, 6) || "454fda";
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function hasRealKey(value) {
  return Boolean(value && !value.toLowerCase().startsWith("your_"));
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}
