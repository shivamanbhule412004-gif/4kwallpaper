# 4K Wallpaper - Production Ready Code

Complete 4K wallpaper website with **Pinterest-style algorithm**, infinite scroll, related posts, and beautiful UI/UX.

## ✨ Features

### Home Feed (Pinterest Algorithm)
- **Smart Feed Mix**: 50% trending + 30% newest + 20% editor picks
- **Infinite Scroll**: Lazy load 20 wallpapers per page
- **Masonry Grid**: Responsive 2-5 columns based on screen size
- **Blur Placeholder**: Images load with skeleton + blur effect

### Post Preview
- **Full Modal View**: Click any wallpaper to open preview
- **Image Zoom**: Object-contain full image display
- **Detailed Info**: 
  - Title, resolution, file size, format
  - Download count, view count
  - Category, tags (clickable)
  - Upload date
- **FREE DOWNLOAD Button**: Trigger download with count increment
- **Keyboard Navigation**: Arrow keys to browse, ESC to close
- **Like/Save**: Heart button to save wallpapers

### Related Posts Section
- **"More Like This" Grid**: 12+ related wallpapers
- **Smart Algorithm**: Same category + matching tags + similar download count
- **Infinite Scroll**: Load more as you scroll
- **Same Card Design**: Consistent with home feed

### Download Flow
- Click download button
- Wallpaper count increments in database
- Browser downloads file automatically

### Search & Filter
- **Real-time Search**: Type to filter wallpapers
- **Category Filter**: Browse by category
- **Sort Modes**: Latest, Trending, Popular
- **Responsive**: Mobile, tablet, desktop optimized

## 🎨 Design System

**Colors:**
- Primary Blue: `#2B6FE8`
- Text Dark: `#111111`
- Borders: `#f0f0f2` (light), `gray-100` (medium)

**Typography:**
- Font: DM Sans
- Sizes: 12px (small), 13px (body), 14px-17px (heading), 18px (modal title), 24px (section)

**Spacing:**
- Card radius: 2xl (16px)
- Modal radius: 3xl (24px)
- Padding: 4px, 8px, 16px, 24px, 32px standard

**Hover Effects:**
- Image scale: 1.05x
- Overlay: black 30%
- Button transitions: 300ms

## 📦 Tech Stack

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "typescript": "latest",
  "vite": "6.3.5",
  "tailwindcss": "4.1.12",
  "react-responsive-masonry": "2.7.1",
  "@supabase/supabase-js": "latest",
  "lucide-react": "0.487.0"
}
```

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Setup Supabase

Create project at [supabase.com](https://supabase.com)

**Run SQL migrations:**
```sql
CREATE TABLE wallpapers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  resolution TEXT,
  file_size TEXT,
  format TEXT,
  category TEXT,
  tags TEXT[],
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  is_editor_pick BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, wallpaper_id)
);

CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx (Main app with feed algorithm)
│   └── components/
│       ├── Header.tsx (Logo, search, nav)
│       ├── WallpaperCard.tsx (Card component)
│       ├── WallpaperGrid.tsx (Masonry grid)
│       ├── WallpaperModal.tsx (Preview + related posts)
│       ├── RelatedPosts.tsx (More like this section)
│       ├── CategoryFilter.tsx (Category selector)
│       └── AdminUpload.tsx (Admin panel)
├── lib/
│   ├── supabase.ts (Client config)
│   └── feedAlgorithm.ts (Smart algorithm)
├── styles/
│   └── index.css (Tailwind + globals)
└── main.tsx (Entry point)
```

## 🎯 Key Features Explained

### Smart Feed Algorithm
```typescript
// 50% trending (downloads)
// 30% newest (uploaded date)
// 20% editor picks (view count)
// Duplicates removed, order preserved
```

### Related Posts Algorithm
```typescript
// Same category: +100 points
// Matching tags: +30 points per tag
// Similar download count (<1000 diff): +20 points
// Sort by score, return top 12
```

### Infinite Scroll
```typescript
// Observe bottom of grid
// Load 20 more items on scroll
// Smooth pagination
```

## 🔐 Security

- Supabase RLS (Row Level Security) enabled
- Anon key only (limited permissions)
- Download count increment server-side only
- User auth optional for likes/collections

## 📱 Responsive

- **Mobile (350px)**: 2 columns
- **Tablet (640px)**: 3 columns
- **Desktop (900px)**: 4 columns
- **Large (1200px)**: 5 columns

## ⚡ Performance

- Lazy loading images
- Blur placeholder during load
- Infinite scroll (not all at once)
- SEO optimized (meta tags, JSON-LD)
- Preconnect fonts + CDN

## 🎁 Bonus Features

- Dark mode ready (next-themes installed)
- Admin upload panel (secret: click logo 5×)
- SEO meta tags + structured data
- Keyboard navigation (arrow keys, ESC)
- Share wallpapers (copy link)
- Download counter

## 📝 Usage

### Search
Type in search bar to filter by title, description, tags, category

### Sort
- **Latest**: Newest wallpapers first
- **Trending**: Smart mix (50% downloads + 30% new + 20% editor)
- **Popular**: Most downloads first

### Categories
Click category pills to filter by category

### Download
Click "Download 4K Wallpaper" button to download

### Related Posts
Scroll down in modal to see "More Like This" section

## 🤝 Contributing

Fork, create branch, submit PR

## 📄 License

Free for personal use. See ATTRIBUTIONS.md

## 🙋 Support

Issues? Check sample data loads by default if API fails.

---

**Built with ❤️ using React + TypeScript + Tailwind + Supabase**
