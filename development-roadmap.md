# Picky - Development Roadmap

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Expo Project
- [ ] Create new Expo project with TypeScript template
- [ ] Install core dependencies (expo-media-library, expo-av, expo-haptics)
- [ ] Configure app.json with proper name, bundle ID, and permissions
- [ ] Set up Italian locale configuration
- [ ] Test blank app on Expo Go

### Task 1.2: Navigation Structure
- [ ] Install and configure expo-router for tab navigation
- [ ] Create three tab screens (Pulizia, Statistiche, Impostazioni)
- [ ] Design and implement bottom tab bar with Italian labels
- [ ] Add proper icons for each tab
- [ ] Ensure navigation state persists

### Task 1.3: Basic UI Theme
- [ ] Create theme configuration file with colors and typography
- [ ] Implement Italian font system (supporting special characters)
- [ ] Set up global styles for consistent spacing
- [ ] Create reusable UI components (Button, Card, Text)
- [ ] Add SafeAreaView wrapper for all screens

## Phase 2: Media Library Integration

### Task 2.1: Permissions & Access
- [ ] Implement permission request flow with Italian text
- [ ] Handle permission denied state gracefully
- [ ] Create MediaLibrary service wrapper
- [ ] Test on both iOS and Android via Expo Go
- [ ] Add error handling for missing permissions

### Task 2.2: Album Loading
- [ ] Fetch all available albums from device
- [ ] Implement smart album detection (WhatsApp, Screenshots, etc.)
- [ ] Sort albums by photo count
- [ ] Create album picker component
- [ ] Cache album list for performance

### Task 2.3: Photo/Video Loading
- [ ] Load photos from selected album
- [ ] Implement pagination for large albums
- [ ] Handle iCloud photo downloading
- [ ] Create progress indicator for downloads
- [ ] Ensure videos load with audio capability

## Phase 3: Core Swiping Interface

### Task 3.1: Swipe Card Component
- [ ] Create SwipeCard component with gesture handling
- [ ] Implement smooth swipe animations
- [ ] Add swipe direction detection (left/right/up)
- [ ] Display photo/video in card format
- [ ] Show file size overlay

### Task 3.2: Media Display
- [ ] Implement photo rendering with proper aspect ratios
- [ ] Add video player with autoplay and sound
- [ ] Handle different media orientations
- [ ] Add loading states for media
- [ ] Implement error states for corrupted files

### Task 3.3: Swipe Actions
- [ ] Connect right swipe to "keep" action
- [ ] Connect left swipe to "trash" action
- [ ] Connect up swipe to "favorites" action
- [ ] Add visual feedback for each swipe direction
- [ ] Implement undo functionality

## Phase 4: Data Management

### Task 4.1: Progress Tracking
- [ ] Store last viewed photo ID per album
- [ ] Implement "continue where you left off" logic
- [ ] Track new photos since last session
- [ ] Create "Nuove foto" popup component
- [ ] Save viewing history persistently

### Task 4.2: Trash System
- [ ] Create in-app trash storage
- [ ] Track deleted items with metadata
- [ ] Calculate and display trash size
- [ ] Implement empty trash functionality
- [ ] Handle system delete confirmation

### Task 4.3: Favorites Collection
- [ ] Create Picky Favorites storage system
- [ ] Build favorites gallery view
- [ ] Add/remove from favorites functionality
- [ ] Export favorites option
- [ ] Display favorites count in stats

## Phase 5: Statistics & Gamification

### Task 5.1: Statistics Tracking
- [ ] Track total photos processed
- [ ] Calculate storage saved
- [ ] Monitor session statistics
- [ ] Create analytics data structure
- [ ] Implement statistics reset function

### Task 5.2: Progress Visualization
- [ ] Create progress bar component
- [ ] Display percentage completion
- [ ] Show photos remaining count
- [ ] Add daily/weekly/all-time views
- [ ] Implement charts for visual stats

### Task 5.3: Ranking System
- [ ] Define ranking tiers (Bronze, Silver, Gold, etc.)
- [ ] Calculate user rank based on photos processed
- [ ] Create achievement badges
- [ ] Implement rank progression logic
- [ ] Add celebration animations for rank ups

### Task 5.4: Social Sharing
- [ ] Create shareable achievement images
- [ ] Implement native share sheet
- [ ] Add pre-filled Italian messages
- [ ] Include app store link in shares
- [ ] Track sharing analytics

## Phase 6: Polish & UX

### Task 6.1: Animations
- [ ] Add swipe card animations
- [ ] Implement confetti for milestones
- [ ] Create smooth transitions
- [ ] Add loading animations
- [ ] Polish micro-interactions

### Task 6.2: Haptics & Sound
- [ ] Add haptic feedback for swipes
- [ ] Implement milestone haptics (100MB saved)
- [ ] Create sound effect system
- [ ] Add toggle for haptics/sounds
- [ ] Test on various devices

### Task 6.3: Performance Optimization
- [ ] Implement image caching
- [ ] Optimize memory usage
- [ ] Add lazy loading for albums
- [ ] Profile and fix performance bottlenecks
- [ ] Ensure smooth 60fps animations

## Phase 7: Settings & Configuration

### Task 7.1: Settings Screen
- [ ] Create settings UI layout
- [ ] Add haptics/sound toggles
- [ ] Implement statistics reset
- [ ] Add privacy policy link
- [ ] Create data deletion request flow

### Task 7.2: Shuffle Mode
- [ ] Add shuffle toggle to navigation bar
- [ ] Implement random photo selection
- [ ] Maintain shuffle state across sessions
- [ ] Ensure no duplicates in shuffle
- [ ] Add shuffle indicator UI

## Phase 8: Final Polish & Launch Prep

### Task 8.1: Italian Localization
- [ ] Review all text for proper Italian
- [ ] Check number/date formatting
- [ ] Ensure proper text truncation
- [ ] Add Italian app store metadata
- [ ] Get native speaker review

### Task 8.2: Testing & Bug Fixes
- [ ] Test on multiple devices via Expo Go
- [ ] Fix UI issues on different screen sizes
- [ ] Handle edge cases (empty albums, no photos)
- [ ] Performance testing with large libraries
- [ ] User acceptance testing

### Task 8.3: App Store Preparation
- [ ] Create app icons and splash screens
- [ ] Write Italian app store description
- [ ] Prepare screenshots for submission
- [ ] Set up privacy policy
- [ ] Configure EAS Build for production

### Task 8.4: Production Build
- [ ] Configure production environment
- [ ] Set up crash reporting
- [ ] Build iOS binary with EAS
- [ ] Build Android binary with EAS
- [ ] Submit to TestFlight/Internal testing

## Phase 9: Future Enhancements (Post-Launch)

### Task 9.1: Monetization
- [ ] Design premium features
- [ ] Implement subscription system
- [ ] Add payment processing
- [ ] Create upgrade prompts
- [ ] Track conversion metrics

### Task 9.2: Advanced Features
- [ ] Cloud backup for favorites
- [ ] Batch operations
- [ ] Smart suggestions (AI-powered)
- [ ] Multiple selection mode
- [ ] Advanced filtering options

## Development Notes
- Always test with Expo Go during development
- Commit after completing each subtask
- Update PROJECT_ARCHITECTURE.md after each major task
- Keep all text in Italian
- Prioritize smooth performance over features