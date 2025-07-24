# Picky - Development Roadmap

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Expo Project
- [x] Create new Expo project with TypeScript template
- [x] Install core dependencies (expo-media-library, expo-av, expo-haptics)
- [x] Configure app.json with proper name, bundle ID, and permissions
- [x] Set up Italian locale configuration
- [x] Test blank app on Expo Go

### Task 1.2: Navigation Structure
- [x] Install and configure expo-router for tab navigation
- [x] Create three tab screens (Pulizia, Statistiche, Impostazioni)
- [x] Design and implement bottom tab bar with Italian labels
- [x] Add proper icons for each tab
- [x] Ensure navigation state persists

### Task 1.3: Basic UI Theme
- [x] Create theme configuration file with colors and typography
- [x] Implement Italian font system (supporting special characters)
- [x] Set up global styles for consistent spacing
- [x] Create reusable UI components (Button, Card, Text)
- [x] Add SafeAreaView wrapper for all screens

## Phase 2: Media Library Integration

### Task 2.1: Permissions & Access
- [x] Implement permission request flow with Italian text
- [x] Handle permission denied state gracefully
- [x] Create MediaLibrary service wrapper
- [x] Test on both iOS and Android via Expo Go
- [x] Add error handling for missing permissions

### Task 2.2: Album Loading
- [x] Fetch all available albums from device
- [x] Implement smart album detection (WhatsApp, Screenshots, etc.)
- [x] Sort albums by photo count
- [x] Create album picker component
- [x] Cache album list for performance

### Task 2.3: Photo/Video Loading
- [x] Load photos from selected album
- [x] Implement pagination for large albums
- [x] Handle iCloud photo downloading
- [x] Create progress indicator for downloads
- [x] Ensure videos load with audio capability
- [x] **BUGFIX**: Resolve iOS ph:// URL compatibility issues

## Phase 3: Core Swiping Interface

### Task 3.1: Swipe Card Component
- [x] Create SwipeCard component with gesture handling
- [x] Implement smooth swipe animations
- [x] Add swipe direction detection (left/right/up)
- [x] Display photo/video in card format
- [x] Show file size overlay
- [x] Add visual feedback for swipe directions
- [x] Integrate with Pulizia screen and media loading system

### Task 3.2: Media Display
- [x] Implement photo rendering with proper aspect ratios
- [x] Add video player with autoplay and sound
- [x] Handle different media orientations
- [x] Add loading states for media
- [x] Implement error states for corrupted files

### Task 3.3: Swipe Actions
- [x] Connect right swipe to "keep" action
- [x] Connect left swipe to "trash" action
- [x] Connect up swipe to "favorites" action
- [x] Add visual feedback for each swipe direction
- [x] Implement undo functionality

## Phase 4: Data Management

### Task 4.1: Progress Tracking
- [ ] Store last viewed photo ID per album
- [ ] Implement "continue where you left off" logic
- [ ] Track new photos since last session
- [ ] Create "Nuove foto" popup component
- [ ] Save viewing history persistently

### Task 4.2: Trash System
- [x] Create in-app trash storage
- [x] Track deleted items with metadata
- [x] Calculate and display trash size
- [x] Implement empty trash functionality
- [x] Handle system delete confirmation

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