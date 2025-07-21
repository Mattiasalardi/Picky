# Picky - Project Context

## Overview
**Picky** is a gamified photo/video cleanup app designed exclusively for Italian users. It uses a Tinder-like swiping interface to help users quickly organize their camera roll, delete unwanted media, and save storage space.

## Core Concept
Users swipe through their photos and videos one by one:
- **Swipe Right** → Keep the photo/video
- **Swipe Left** → Send to trash (delete)
- **Swipe Up** → Add to "Picky Favorites" special collection

## Key Features

### 1. Camera Roll Integration
- One-tap photo library permission request
- Automatic iCloud placeholder download with progress indicator
- Access to all photos, videos (with sound), and albums

### 2. Album Organization
- "Scegli album" (Choose album) picker
- Smart albums prioritized (Selfies, Video, WhatsApp, Schermate)
- Albums sorted by size (largest first)
- Dynamic loading from user's actual camera roll (no hardcoded albums)

### 3. Smart Navigation
- Most recent photos/videos shown first
- "Continue where you left off" functionality
- "Nuove foto" (New photos) popup showing photos added since last session
- Option to start from beginning
- Shuffle mode for random order

### 4. Trash System
- In-app trash collection
- Shows total size of trash
- Batch delete with system confirmation
- Individual file sizes displayed (e.g., "2,3 MB")

### 5. Picky Favorites
- Special in-app collection for favorite photos
- Created on first use
- Accessible from statistics page

### 6. Gamification Elements
- Bronze, Silver, Gold ranking system based on photos processed
- Confetti animations on milestones
- Haptic feedback every 100 MB saved
- Share achievements functionality
- Progress bar showing completion percentage

### 7. Statistics & Analytics
- Total storage saved counter (live updates)
- All-time statistics
- Number of files processed/deleted
- Biggest single cleanup session
- Progress tracking (e.g., "200/10.000 foto - 2% completato")

### 8. Technical Requirements
- Built with Expo and React Native
- TypeScript for type safety
- Compatible with Expo Go for development
- Deployable to App Store and Google Play
- Full Italian language (no English)

### 9. Navigation Structure
Bottom tab navigation with three tabs:
1. **Pulizia** - Main swiping interface
2. **Statistiche** - Stats, rankings, and Picky Favorites
3. **Impostazioni** - Settings page

### 10. Settings Page
- Manage Subscription (future monetization)
- Privacy Policy link
- Data deletion request
- Reset statistics
- Toggle haptics & sound effects

## Important Technical Constraints
1. Must work with Expo Go for live testing
2. Videos must autoplay with sound
3. All text in Italian
4. Modern, premium App Store aesthetic
5. Smooth animations and transitions
6. Responsive to different screen sizes

## User Experience Philosophy
- **Fast & Fluid**: Instant response to swipes
- **Satisfying**: Haptic feedback, animations, progress tracking
- **Addictive**: Gamification encourages continued use
- **Simple**: No complex menus or options
- **Premium**: High-quality UI matching App Store standards

## Monetization (Future)
- Currently free
- Potential premium features later
- Subscription management ready in settings

## Target Audience
Italian smartphone users who:
- Have cluttered camera rolls
- Want a fun way to clean up photos
- Appreciate gamified experiences
- Value storage space

## Success Metrics
- Photos processed per session
- User retention
- Storage space freed
- Social shares of achievements