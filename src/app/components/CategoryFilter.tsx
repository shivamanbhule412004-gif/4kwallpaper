import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  if (categories.length <= 1) return null;

  return (
    <div className="relative flex items-center gap-1">
      <button
        className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 text-[13px] font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
              selected === cat
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-white text-[#111111] border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        className="shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
