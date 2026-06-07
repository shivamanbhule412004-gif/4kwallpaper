import { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { WallpaperGrid } from "./components/WallpaperGrid";
import { WallpaperModal } from "./components/WallpaperModal";
import { AdminUpload } from "./components/AdminUpload";
import { CategoryFilter } from "./components/CategoryFilter";
import { Wallpaper } from "./components/WallpaperCard";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { RefreshCw, TrendingUp, Clock, Sparkles } from "lucide-react";
import logoImg from "../imports/ChatGPT_Image_Jun_1__2026__07_31_03_PM__2_.png";
// Logo: dark rounded icon with "4" and blue dot accent

const API = `https://${projectId}.supabase.co/functions/v1/make-server-595c7c29`;
const HEADERS = { Authorization: `Bearer ${publicAnonKey}` };

// --- SEO meta injection (runs once) ---
(function injectMeta() {
  const metas: Record<string, string> = {
    description: "Download free 4K and 8K ultra HD wallpapers. Thousands of high-resolution desktop, mobile, and laptop wallpapers — nature, abstract, space, cities, architecture and more.",
    keywords: "4k wallpapers, free wallpapers, HD wallpapers, desktop wallpapers, 8K wallpapers, nature wallpapers, abstract wallpapers, space wallpapers, city wallpapers",
    author: "4kwallpaper",
    robots: "index, follow",
    "og:title": "4kwallpaper — Free 4K & Ultra HD Wallpapers",
    "og:description": "Download thousands of free 4K wallpapers. High-resolution images for desktop, mobile and laptop screens.",
    "og:type": "website",
    "og:url": "https://4kwallpaper.pages.dev",
    "og:site_name": "4kwallpaper",
    "twitter:card": "summary_large_image",
    "twitter:title": "4kwallpaper — Free 4K & Ultra HD Wallpapers",
    "twitter:description": "Download free 4K and ultra HD wallpapers for all devices.",
    "theme-color": "#2B6FE8",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  };

  document.title = "4kwallpaper — Free 4K & Ultra HD Wallpapers";

  // Canonical
  if (!document.querySelector("link[rel='canonical']")) {
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = "https://4kwallpaper.pages.dev";
    document.head.appendChild(link);
  }

  Object.entries(metas).forEach(([name, content]) => {
    const isOg = name.startsWith("og:") || name.startsWith("twitter:");
    const attr = isOg ? "property" : "name";
    const existing = document.querySelector(`meta[${attr}="${name}"]`);
    if (existing) {
      existing.setAttribute("content", content);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    }
  });

  // Schema.org JSON-LD
  if (!document.querySelector("#jsonld-website")) {
    const script = document.createElement("script");
    script.id = "jsonld-website";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "4kwallpaper",
      url: "https://4kwallpaper.pages.dev",
      description: "Free 4K and ultra HD wallpaper downloads",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://4kwallpaper.pages.dev/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });
    document.head.appendChild(script);
  }

  // Preconnect for performance
  ["https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://images.unsplash.com"].forEach((href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      if (href.includes("gstatic")) link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  });
})();

type SortMode = "latest" | "popular" | "trending";

const SAMPLE_WALLPAPERS: Wallpaper[] = [
  {
    id: "sample-1",
    title: "Misty Mountain Forest",
    description: "A breathtaking misty mountain forest at dawn with golden light filtering through the trees.",
    category: "Nature",
    tags: ["mountain", "forest", "mist", "dawn", "trees"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop&auto=format",
    fileSize: "8.2 MB",
    downloadCount: 2841,
    views: 14320,
    uploadedAt: "2026-06-01T08:00:00Z",
  },
  {
    id: "sample-2",
    title: "Neon City Nights",
    description: "Vibrant neon reflections on rain-soaked city streets after midnight.",
    category: "Cities",
    tags: ["neon", "city", "night", "rain", "urban"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=1100&fit=crop&auto=format",
    fileSize: "6.7 MB",
    downloadCount: 5123,
    views: 28940,
    uploadedAt: "2026-06-02T10:00:00Z",
  },
  {
    id: "sample-3",
    title: "Deep Space Nebula",
    description: "A stunning deep space nebula captured by orbital telescope, showing cosmic dust clouds.",
    category: "Space",
    tags: ["space", "nebula", "galaxy", "stars", "cosmos"],
    resolution: "7680x4320",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop&auto=format",
    fileSize: "18.4 MB",
    downloadCount: 9201,
    views: 47800,
    uploadedAt: "2026-06-03T12:00:00Z",
  },
  {
    id: "sample-4",
    title: "Geometric Abstract Prism",
    description: "Minimalist geometric shapes with prismatic light refractions on white background.",
    category: "Abstract",
    tags: ["geometric", "abstract", "prism", "light", "minimal"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&h=1000&fit=crop&auto=format",
    fileSize: "4.1 MB",
    downloadCount: 1674,
    views: 8230,
    uploadedAt: "2026-06-04T09:00:00Z",
  },
  {
    id: "sample-5",
    title: "Santorini Sunset Cliffs",
    description: "Golden hour over the iconic white-washed cliffs of Santorini, Greece.",
    category: "Travel",
    tags: ["santorini", "greece", "sunset", "travel", "mediterranean"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop&auto=format",
    fileSize: "7.8 MB",
    downloadCount: 4392,
    views: 22140,
    uploadedAt: "2026-06-04T14:00:00Z",
  },
  {
    id: "sample-6",
    title: "Macro Water Droplets",
    description: "Ultra close-up macro photography of water droplets on a green leaf at sunrise.",
    category: "Nature",
    tags: ["macro", "water", "droplets", "leaf", "morning"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=900&fit=crop&auto=format",
    fileSize: "5.3 MB",
    downloadCount: 3017,
    views: 15600,
    uploadedAt: "2026-06-05T07:00:00Z",
  },
  {
    id: "sample-7",
    title: "Glass Architecture",
    description: "Modern glass and steel skyscraper facade reflecting clouds and blue sky.",
    category: "Architecture",
    tags: ["architecture", "glass", "modern", "skyscraper", "reflection"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=1100&fit=crop&auto=format",
    fileSize: "6.2 MB",
    downloadCount: 2188,
    views: 11470,
    uploadedAt: "2026-06-05T11:00:00Z",
  },
  {
    id: "sample-8",
    title: "Aurora Borealis Iceland",
    description: "Vivid northern lights dancing over a frozen Icelandic lake at midnight.",
    category: "Nature",
    tags: ["aurora", "northern lights", "iceland", "night", "winter"],
    resolution: "7680x4320",
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=560&fit=crop&auto=format",
    fileSize: "14.6 MB",
    downloadCount: 11832,
    views: 59200,
    uploadedAt: "2026-06-05T20:00:00Z",
  },
  {
    id: "sample-9",
    title: "Minimalist White Room",
    description: "Serene Scandinavian interior with natural light flooding through large windows.",
    category: "Minimalist",
    tags: ["minimal", "interior", "white", "scandinavian", "clean"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&h=600&fit=crop&auto=format",
    fileSize: "3.8 MB",
    downloadCount: 1543,
    views: 7890,
    uploadedAt: "2026-06-06T08:00:00Z",
  },
  {
    id: "sample-10",
    title: "Snow Leopard in Wild",
    description: "Rare snow leopard portrait in its natural Himalayan habitat, extreme close-up.",
    category: "Animals",
    tags: ["snow leopard", "wildlife", "himalaya", "animal", "portrait"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&h=1050&fit=crop&auto=format",
    fileSize: "9.1 MB",
    downloadCount: 6720,
    views: 33450,
    uploadedAt: "2026-06-06T15:00:00Z",
  },
  {
    id: "sample-11",
    title: "Cyberpunk Tokyo Street",
    description: "Futuristic Tokyo street scene with holographic billboards and neon signs at dusk.",
    category: "Cities",
    tags: ["tokyo", "cyberpunk", "neon", "futuristic", "japan"],
    resolution: "3840x2160",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format",
    fileSize: "7.4 MB",
    downloadCount: 8341,
    views: 41700,
    uploadedAt: "2026-06-07T06:00:00Z",
  },
  {
    id: "sample-12",
    title: "Ocean Wave Crash",
    description: "Epic powerful ocean wave breaking at sunset, captured with drone photography.",
    category: "Nature",
    tags: ["ocean", "wave", "sunset", "sea", "power"],
    resolution: "7680x4320",
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop&auto=format",
    fileSize: "16.2 MB",
    downloadCount: 7924,
    views: 38600,
    uploadedAt: "2026-06-07T09:00:00Z",
  },
];

export default function App() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const fetchWallpapers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`${API}/wallpapers?${params}`, { headers: HEADERS });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      let result: Wallpaper[] = data.wallpapers || [];

      // Merge sample wallpapers if no real wallpapers uploaded yet
      if (result.length === 0) {
        result = SAMPLE_WALLPAPERS.filter((w) => {
          if (selectedCategory !== "All" && w.category !== selectedCategory) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
              w.title.toLowerCase().includes(q) ||
              w.description.toLowerCase().includes(q) ||
              w.tags.some((t) => t.toLowerCase().includes(q)) ||
              w.category.toLowerCase().includes(q)
            );
          }
          return true;
        });
      } else {
        // Append sample wallpapers at the end as inspiration
        const sampleFiltered = SAMPLE_WALLPAPERS.filter((s) => {
          if (selectedCategory !== "All" && s.category !== selectedCategory) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return s.title.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q));
          }
          return true;
        });
        result = [...result, ...sampleFiltered];
      }

      // Apply sort
      if (sortMode === "popular") result.sort((a, b) => b.downloadCount - a.downloadCount);
      else if (sortMode === "trending") result.sort((a, b) => b.views - a.views);
      else result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      setWallpapers(result);

      // Update categories
      const allCats = ["All", ...new Set(result.map((w) => w.category))];
      setCategories(allCats);
    } catch (err) {
      console.error("Error fetching wallpapers:", err);
      // Fallback to sample data
      setWallpapers(SAMPLE_WALLPAPERS);
      setCategories(["All", ...new Set(SAMPLE_WALLPAPERS.map((w) => w.category))]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortMode]);

  useEffect(() => {
    fetchWallpapers();
  }, [fetchWallpapers]);

  const handleDownload = async (wallpaper: Wallpaper) => {
    try {
      if (wallpaper.id.startsWith("sample-")) {
        window.open(wallpaper.imageUrl, "_blank");
        return;
      }
      const res = await fetch(`${API}/wallpapers/${wallpaper.id}/download`, {
        method: "POST",
        headers: HEADERS,
      });
      const data = await res.json();
      const url = data.downloadUrl || wallpaper.imageUrl;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${wallpaper.title.replace(/\s+/g, "-").toLowerCase()}-4k.jpg`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      window.open(wallpaper.imageUrl, "_blank");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this wallpaper?")) return;
    try {
      await fetch(`${API}/wallpapers/${id}`, { method: "DELETE", headers: HEADERS });
      fetchWallpapers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Secret admin toggle: click logo 5 times
  const handleLogoClick = () => {
    const count = adminClickCount + 1;
    setAdminClickCount(count);
    if (count >= 5) {
      setShowAdmin(true);
      setAdminClickCount(0);
    }
  };

  const displayedWallpapers = wallpapers;

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onAdminToggle={handleLogoClick}
      />

      <main>
        {/* Hero bar */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Category filter */}
            <div className="flex-1 min-w-0">
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(
                [
                  { id: "latest" as SortMode, icon: Clock, label: "Latest" },
                  { id: "trending" as SortMode, icon: TrendingUp, label: "Trending" },
                  { id: "popular" as SortMode, icon: Sparkles, label: "Popular" },
                ] as const
              ).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSortMode(id)}
                  className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-full border transition-all ${
                    sortMode === id
                      ? "bg-[#2B6FE8] text-white border-[#2B6FE8]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
              <button
                onClick={fetchWallpapers}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-gray-400 transition-colors text-gray-600"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {!loading && displayedWallpapers.length > 0 && (
          <div className="bg-gradient-to-r from-[#f8faff] to-white border-b border-gray-100 px-4 md:px-8 py-2.5">
            <div className="max-w-[1600px] mx-auto flex items-center gap-4">
              <p className="text-[12px] text-gray-500 font-medium">
                <span className="font-bold text-[#111111]">{displayedWallpapers.length.toLocaleString()}</span> wallpapers
                {selectedCategory !== "All" && (
                  <> in <span className="text-[#2B6FE8] font-bold">{selectedCategory}</span></>
                )}
                {searchQuery && (
                  <> for <span className="text-[#2B6FE8] font-bold">"{searchQuery}"</span></>
                )}
              </p>
              <div className="h-3 w-px bg-gray-200" />
              <p className="text-[12px] text-gray-500 font-medium">
                Up to <span className="font-bold text-[#111111]">8K</span> resolution · Free downloads
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
          <WallpaperGrid
            wallpapers={displayedWallpapers}
            loading={loading}
            onWallpaperClick={setSelectedWallpaper}
            onDownload={handleDownload}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10 px-4 md:px-8 mt-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="4kwallpaper" className="w-9 h-9 rounded-xl" />
                <span className="text-[17px] font-bold text-[#111111]">4kwallpaper</span>
              </div>
              <p className="text-[13px] text-gray-500 max-w-xs text-center md:text-left">
                Free high-resolution 4K & 8K wallpapers for every screen. New uploads daily.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 text-[13px]">
              <div>
                <p className="font-bold text-[#111111] mb-2.5">Browse</p>
                {["Nature", "Cities", "Space", "Abstract", "Animals"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className="block text-gray-500 hover:text-[#2B6FE8] mb-1.5 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div>
                <p className="font-bold text-[#111111] mb-2.5">Resolution</p>
                {["4K (3840×2160)", "8K (7680×4320)", "QHD (2560×1440)", "FHD (1920×1080)"].map((r) => (
                  <p key={r} className="text-gray-500 mb-1.5">{r}</p>
                ))}
              </div>
              <div>
                <p className="font-bold text-[#111111] mb-2.5">About</p>
                {["About Us", "Contact", "License", "Privacy Policy"].map((l) => (
                  <a key={l} href="#" className="block text-gray-500 hover:text-[#2B6FE8] mb-1.5 transition-colors">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-gray-400">
              © 2026 4kwallpaper. All wallpapers are free for personal use.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-gray-400">Hosted on</span>
              <span className="text-[12px] font-bold text-gray-600">GitHub Pages · Cloudflare</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallpaper detail modal */}
      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
          onDownload={handleDownload}
          wallpapers={displayedWallpapers}
        />
      )}

      {/* Admin panel (secret: click logo 5×) */}
      {showAdmin && (
        <AdminUpload
          onClose={() => setShowAdmin(false)}
          onUploaded={fetchWallpapers}
          wallpapers={wallpapers.filter((w) => !w.id.startsWith("sample-"))}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
