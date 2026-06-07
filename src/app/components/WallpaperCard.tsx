import { useState } from "react";
import { Download, Eye, Heart, Expand } from "lucide-react";

export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  resolution: string;
  imageUrl: string;
  storagePath?: string;
  fileSize: string;
  downloadCount: number;
  views: number;
  uploadedAt: string;
}

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onClick: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export function WallpaperCard({ wallpaper, onClick, onDownload }: WallpaperCardProps) {
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-100 break-inside-avoid mb-4"
      onClick={() => onClick(wallpaper)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}
        <img
          src={wallpaper.imageUrl}
          alt={wallpaper.title}
          className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

        {/* Action buttons on hover */}
        <div className="absolute inset-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {/* Download */}
          <button
            className="flex items-center gap-1.5 bg-white text-[#111111] text-[12px] font-bold px-3 py-2 rounded-full hover:bg-[#2B6FE8] hover:text-white transition-colors shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(wallpaper);
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          <div className="flex gap-2">
            {/* Like */}
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all ${
                liked
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>

            {/* Expand */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onClick(wallpaper);
              }}
            >
              <Expand className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resolution badge */}
        <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wide">
            {wallpaper.resolution}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3 bg-white">
        <h3
          className="text-[13px] font-semibold text-[#111111] truncate leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {wallpaper.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-[#2B6FE8] font-medium bg-blue-50 px-2 py-0.5 rounded-full">
            {wallpaper.category}
          </span>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {wallpaper.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {wallpaper.downloadCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
