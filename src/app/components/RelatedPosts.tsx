import { useEffect, useState, useRef } from "react";
import { Wallpaper } from "./WallpaperCard";
import { WallpaperCard } from "./WallpaperCard";
import Masonry from "react-responsive-masonry";
import ResponsiveMasonry from "react-responsive-masonry";
import { getRelatedWallpapers } from "../../lib/feedAlgorithm";
import { ChevronRight } from "lucide-react";

interface RelatedPostsProps {
  wallpaper: Wallpaper;
  allWallpapers: Wallpaper[];
  onWallpaperClick: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export function RelatedPosts({
  wallpaper,
  allWallpapers,
  onWallpaperClick,
  onDownload,
}: RelatedPostsProps) {
  const [related, setRelated] = useState<Wallpaper[]>([]);
  const [displayCount, setDisplayCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const relatedWallpapers = getRelatedWallpapers(wallpaper, allWallpapers, 24);
    setRelated(relatedWallpapers);
  }, [wallpaper, allWallpapers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < related.length) {
          setDisplayCount((prev) => Math.min(prev + 12, related.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [displayCount, related.length]);

  if (related.length === 0) {
    return null;
  }

  const displayedWallpapers = related.slice(0, displayCount);

  return (
    <div className="w-full bg-white border-t border-gray-100 py-8">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <h2
            className="text-[24px] font-bold text-[#111111]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            More Like This
          </h2>
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>

        {/* Subtitle */}
        <p className="text-[14px] text-gray-500 mb-6">
          Similar wallpapers based on category and tags
        </p>

        {/* Grid */}
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 640: 3, 900: 4, 1200: 5 }}>
          <Masonry gutter="16px">
            {displayedWallpapers.map((w) => (
              <WallpaperCard
                key={w.id}
                wallpaper={w}
                onClick={onWallpaperClick}
                onDownload={onDownload}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>

        {/* Lazy load trigger */}
        {displayCount < related.length && (
          <div ref={observerTarget} className="h-4 mt-8" />
        )}

        {/* Load more info */}
        {displayCount < related.length && (
          <div className="text-center mt-8">
            <p className="text-[13px] text-gray-400">
              Loading more... ({displayCount} of {related.length})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
