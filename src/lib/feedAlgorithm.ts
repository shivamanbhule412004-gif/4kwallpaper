import { Wallpaper } from '../components/WallpaperCard'

/**
 * Smart feed algorithm mixing:
 * - 50% trending (most downloads)
 * - 30% newest first
 * - 20% editor picks
 */
export function generateSmartFeed(wallpapers: Wallpaper[], limit: number = 50): Wallpaper[] {
  if (wallpapers.length === 0) return []

  const trendingCount = Math.ceil(limit * 0.5)
  const newestCount = Math.ceil(limit * 0.3)
  const editorCount = Math.ceil(limit * 0.2)

  // Get trending wallpapers (by downloads)
  const trending = [...wallpapers]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, trendingCount)

  // Get newest wallpapers
  const newest = [...wallpapers]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, newestCount)

  // Get editor picks (marked or highest view count)
  const editors = [...wallpapers]
    .sort((a, b) => b.views - a.views)
    .slice(0, editorCount)

  // Combine and shuffle while maintaining ratio
  const combined = [
    ...trending.slice(0, trendingCount),
    ...newest.slice(0, newestCount),
    ...editors.slice(0, editorCount),
  ]

  // Remove duplicates while preserving order
  const seen = new Set<string>()
  return combined.filter((w) => {
    if (seen.has(w.id)) return false
    seen.add(w.id)
    return true
  })
}

/**
 * Find related wallpapers based on category and tags
 */
export function getRelatedWallpapers(
  current: Wallpaper,
  allWallpapers: Wallpaper[],
  limit: number = 12
): Wallpaper[] {
  const scored = allWallpapers
    .filter((w) => w.id !== current.id)
    .map((w) => {
      let score = 0

      // Same category: 100 points
      if (w.category === current.category) score += 100

      // Matching tags: 30 points per tag
      const matchingTags = current.tags.filter((t) => w.tags.includes(t)).length
      score += matchingTags * 30

      // Similar download count: 20 points
      const downloadDiff = Math.abs(w.downloadCount - current.downloadCount)
      if (downloadDiff < 1000) score += 20

      return { wallpaper: w, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map((item) => item.wallpaper)
}

/**
 * Smart pagination with lazy loading simulation
 */
export function getPaginatedWallpapers(
  wallpapers: Wallpaper[],
  page: number,
  pageSize: number = 20
): Wallpaper[] {
  const start = (page - 1) * pageSize
  return wallpapers.slice(start, start + pageSize)
}
