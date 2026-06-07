import Masonry from "react-responsive-masonry";
import ResponsiveMasonry from "react-responsive-masonry";
import { WallpaperCard, Wallpaper } from "./WallpaperCard";
import { ImageOff } from "lucide-react";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  loading: boolean;
  onWallpaperClick: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-100 break-inside-avoid mb-4">
      <div className="w-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" style={{ height: `${Math.random() * 120 + 160}px` }} />
      <div className="p-3 bg-white">
        <div className="h-3 bg-gray-200 rounded-full animate-pulse w-3/4 mb-2" />
        <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function WallpaperGrid({ wallpapers, loading, onWallpaperClick, onDownload }: WallpaperGridProps) {
  if (loading) {
    return (
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 640: 3, 900: 4, 1200: 5 }}>
        <Masonry gutter="16px">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <ImageOff className="w-9 h-9 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          No wallpapers found
        </h3>
        <p className="text-[14px] text-gray-500 max-w-sm">
          Try adjusting your search or filters, or check back soon for new uploads.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 640: 3, 900: 4, 1200: 5 }}>
      <Masonry gutter="16px">
        {wallpapers.map((wallpaper) => (
          <WallpaperCard
            key={wallpaper.id}
            wallpaper={wallpaper}
            onClick={onWallpaperClick}
            onDownload={onDownload}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
