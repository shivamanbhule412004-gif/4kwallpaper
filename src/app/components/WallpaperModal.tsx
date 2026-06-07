import { useEffect, useState } from "react";
import { X, Download, Share2, Eye, Calendar, Tag, Monitor, FileText, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Wallpaper } from "./WallpaperCard";
import { RelatedPosts } from "./RelatedPosts";

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onDownload: (wallpaper: Wallpaper) => void;
  wallpapers: Wallpaper[];
  onSelectWallpaper?: (wallpaper: Wallpaper) => void;
}

export function WallpaperModal({ 
  wallpaper, 
  onClose, 
  onDownload, 
  wallpapers,
  onSelectWallpaper 
}: WallpaperModalProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!wallpaper) return;
    const index = wallpapers.findIndex((w) => w.id === wallpaper.id);
    setCurrentIndex(index);
  }, [wallpaper, wallpapers]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, wallpapers]);

  useEffect(() => {
    document.body.style.overflow = wallpaper ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [wallpaper]);

  if (!wallpaper) return null;

  const handleNext = () => {
    if (currentIndex < wallpapers.length - 1) {
      const nextWallpaper = wallpapers[currentIndex + 1];
      if (onSelectWallpaper) onSelectWallpaper(nextWallpaper);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevWallpaper = wallpapers[currentIndex - 1];
      if (onSelectWallpaper) onSelectWallpaper(prevWallpaper);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href + "?id=" + wallpaper.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formattedDate = new Date(wallpaper.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm -z-10" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-[980px] max-h-[92vh] flex flex-col md:flex-row my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="relative flex-1 bg-black min-h-[280px] md:min-h-0 flex items-center justify-center">
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            className="w-full h-full object-contain max-h-[600px]"
          />

          {/* Close */}
          <button
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            onClick={onClose}
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Nav arrows */}
          {currentIndex > 0 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentIndex < wallpapers.length - 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Resolution badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {wallpaper.resolution}
            </span>
          </div>
        </div>

        {/* Info side */}
        <div className="w-full md:w-[300px] lg:w-[340px] flex flex-col overflow-y-auto bg-white max-h-[92vh] md:max-h-full">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-gray-100 sticky top-0 bg-white">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2
                className="text-[18px] font-bold text-[#111111] leading-snug"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {wallpaper.title}
              </h2>
              <button
                className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all ${
                  liked
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                }`}
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {wallpaper.description && (
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {wallpaper.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[20px] font-bold text-[#111111]">
                {wallpaper.views.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Views</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[20px] font-bold text-[#111111]">
                {wallpaper.downloadCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Downloads</div>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-4 flex flex-col gap-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-[11px] text-gray-400 font-medium">Resolution</div>
                <div className="text-[13px] font-semibold text-[#111111]">{wallpaper.resolution}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-[11px] text-gray-400 font-medium">File Size</div>
                <div className="text-[13px] font-semibold text-[#111111]">{wallpaper.fileSize}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-[11px] text-gray-400 font-medium">Uploaded</div>
                <div className="text-[13px] font-semibold text-[#111111]">{formattedDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <div className="text-[11px] text-gray-400 font-medium mb-1.5">Category</div>
                <span className="text-[12px] text-[#2B6FE8] font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                  {wallpaper.category}
                </span>
              </div>
            </div>

            {wallpaper.tags.length > 0 && (
              <div>
                <div className="text-[11px] text-gray-400 font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {wallpaper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 mt-auto flex flex-col gap-2.5 bg-white sticky bottom-0">
            <button
              className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white font-bold text-[14px] h-12 rounded-2xl hover:bg-[#2B6FE8] transition-colors"
              onClick={() => onDownload(wallpaper)}
            >
              <Download className="w-4.5 h-4.5" />
              Download 4K Wallpaper
            </button>

            <button
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-[#111111] font-semibold text-[14px] h-11 rounded-2xl hover:bg-gray-200 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Link Copied!" : "Share"}
            </button>
          </div>
        </div>
      </div>

      {/* Related Posts Section - Outside Modal */}
      {wallpaper && (
        <div className="w-full mt-0">
          <RelatedPosts
            wallpaper={wallpaper}
            allWallpapers={wallpapers}
            onWallpaperClick={(w) => {
              if (onSelectWallpaper) {
                onSelectWallpaper(w);
              }
            }}
            onDownload={onDownload}
          />
        </div>
      )}
    </div>
  );
}
