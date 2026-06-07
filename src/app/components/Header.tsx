import { useState } from "react";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";
import logoImg from "../../imports/ChatGPT_Image_Jun_1__2026__07_31_03_PM__2_.png";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onAdminToggle: () => void;
}

export function Header({ onSearch, searchQuery, onAdminToggle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[rgba(0,0,0,0.08)] shadow-sm">
      <div className="flex items-center h-[64px] px-4 md:px-6 gap-3">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => { e.preventDefault(); onAdminToggle(); }}
          title="Admin"
        >
          <img
            src={logoImg}
            alt="4kwallpaper logo"
            className="w-9 h-9 rounded-xl object-cover"
          />
          <span
            className="hidden md:block text-[17px] font-bold tracking-tight text-[#111111]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            4kwallpaper
          </span>
        </a>

        {/* Explore nav */}
        <nav className="hidden md:flex items-center ml-2">
          <a
            href="#"
            className="flex items-center gap-1 text-[15px] font-semibold text-[#111111] hover:text-[#2B6FE8] px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            Explore
          </a>
        </nav>

        {/* Search bar — center */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[680px] mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search 4K wallpapers, nature, cities, abstract..."
              className="w-full h-[46px] pl-11 pr-5 rounded-full bg-[#f0f0f2] text-[14px] text-[#111111] placeholder-gray-400 border-2 border-transparent focus:border-[#2B6FE8] focus:bg-white focus:outline-none transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </form>

        {/* Right nav */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {["About", "Businesses", "News"].map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[14px] font-semibold text-[#111111] hover:text-[#2B6FE8] px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 flex flex-col gap-1">
          {["Explore", "About", "Businesses", "News"].map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}
              className="text-[15px] font-semibold text-[#111111] py-2.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
