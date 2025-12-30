# Trending Posts Feature

## Overview
The Trending Posts feature allows users to discover and analyze viral content from top creators. It includes comprehensive filtering capabilities to find the most relevant and high-performing posts.

## Features

### 1. **Creator Filtering**
- Multi-select creator filter
- Search creators by name
- Visual avatars for quick identification
- "Select All" and "Select None" options
- Shows selected creator count

### 2. **Date Range Filters**
- **Quick Filters:**
  - All time
  - Last 7 days
  - Last 30 days
  - Last 3 months
  - Last 6 months
  - This year
- **Custom Date Range:**
  - Select specific start and end dates

### 3. **Advanced Filters**
- **Outlier Index:** Measures post virality (0-100 scale)
- **Media Type:** Filter by IMAGE, VIDEO, DOCUMENT, or all types
- **Engagement Metrics:**
  - Likes range (min/max)
  - Comments range (min/max)
  - Reposts range (min/max)
- **Creator Followers Range:** Filter by creator popularity
- **Exclude Keywords:** Exclude posts containing specific keywords

### 4. **Post Display**
Each post card shows:
- Creator name, avatar, and occupation
- Post content (truncated with "..." for long posts)
- Media preview (images/videos)
- Engagement metrics (likes, comments, reposts, views)
- Outlier index badge
- Time since published
- Media type badge

### 5. **Infinite Scroll**
- Load 20 posts at a time
- "Load More" button for additional posts
- Shows loading state during fetch

## Database Schema

### TrendingCreator
```prisma
model TrendingCreator {
  id             String         @id @default(cuid())
  name           String
  image          String?
  bio            String?
  occupation     String?
  followerCount  Int            @default(0)
  isFollowing    Boolean        @default(false)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  trendingPosts  TrendingPost[]
}
```

### TrendingPost
```prisma
model TrendingPost {
  id                String          @id @default(cuid())
  creatorId         String
  content           String
  mediaUrl          String?
  mediaType         MediaType       @default(IMAGE)
  likes             Int             @default(0)
  comments          Int             @default(0)
  reposts           Int             @default(0)
  views             Int             @default(0)
  outlierIndex      Int             @default(50)
  publishedDate     DateTime        @default(now())
  keywords          String[]        @default([])
  creator           TrendingCreator @relation(...)
}
```

## API Endpoints

### GET `/api/trending/posts`
Fetches trending posts with filtering.

**Query Parameters:**
- `limit` - Number of posts per page (default: 20)
- `offset` - Pagination offset (default: 0)
- `search` - Search query for content
- `creatorIds` - Comma-separated creator IDs
- `timeframe` - Quick date filter (all, last7, last30, last3months, last6months, thisyear)
- `dateStart` - Custom start date (YYYY-MM-DD)
- `dateEnd` - Custom end date (YYYY-MM-DD)
- `outlierMin` - Minimum outlier index (0-100)
- `outlierMax` - Maximum outlier index (0-100)
- `mediaType` - Filter by media type (all, image, video, document)
- `likesMin` - Minimum likes
- `likesMax` - Maximum likes
- `commentsMin` - Minimum comments
- `commentsMax` - Maximum comments
- `repostsMin` - Minimum reposts
- `repostsMax` - Maximum reposts
- `excludeKeywords` - Comma-separated keywords to exclude

**Response:**
```json
{
  "posts": [...],
  "total": 145,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

### GET `/api/trending/creators`
Fetches all creators for filtering.

**Response:**
```json
{
  "creators": [...],
  "total": 6
}
```

## Setup Instructions

### 1. Push Database Schema
```bash
npx prisma db push
```

### 2. Seed Sample Data
```bash
npx tsx scripts/seed-trending.ts
```

This will create:
- 6 sample creators (Sahil Chandani, Charlie Hills, MJ Jaindl, Axelle Malek, Ruben Hassid, Sarah Chen)
- 18-30 trending posts with realistic engagement metrics

### 3. Access the Feature
Navigate to `/trending` in your application.

## Components

### `TrendingPostCard.tsx`
Displays individual post with creator info and engagement metrics.

### `CreatorFilterModal.tsx`
Modal for selecting which creators to display posts from.

**Features:**
- Search creators
- Multi-select with checkboxes
- Visual avatars
- Deselect individual creators
- Select All/None actions

### `AdvancedFiltersModal.tsx`
Modal for advanced filtering options.

**Features:**
- Date range picker
- Outlier index slider
- Media type selector
- Engagement range inputs
- Creator followers range
- Keyword exclusion with tags

## Usage Example

```typescript
// Default: Show all posts from all creators
// User opens creator filter
// Selects: Ruben Hassid, Charlie Hills
// Sets timeframe: Last 30 days
// Opens advanced filters:
//   - Outlier index: 50-100
//   - Media type: Video only
//   - Likes: 10,000+
//   - Exclude keywords: "ChatGPT"
// Results: High-performing video posts from selected creators
```

## Design Features

- **Modern UI:** Glassmorphism, gradients, smooth animations
- **Dark Theme:** Eye-friendly dark color scheme
- **Responsive:** Works on mobile, tablet, and desktop
- **Visual Feedback:** Hover effects, loading states
- **Accessibility:** Keyboard navigation, ARIA labels

## Performance Optimizations

- Indexed database fields for fast queries
- Pagination to limit data transfer
- Debounced search input
- Optimistic UI updates
- Image lazy loading with Next.js Image

## Future Enhancements

- [ ] Save filter presets
- [ ] Export posts to CSV
- [ ] Bookmark favorite posts
- [ ] Creator following functionality
- [ ] Trending topics/hashtags
- [ ] Post analytics dashboard
- [ ] AI-powered content suggestions
- [ ] Email alerts for trending posts

## Troubleshooting

### No posts showing
1. Check database connection
2. Run seed script
3. Verify filters aren't too restrictive
4. Check browser console for errors

### Creator filter not working
1. Ensure at least one creator is selected
2. Clear and reselect creators
3. Check API response in Network tab

### Date filter issues
1. Ensure end date is after start date
2. Check date format (YYYY-MM-DD)
3. Verify posts exist in date range
