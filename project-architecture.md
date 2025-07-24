# Picky - Project Architecture

## ⚠️ IMPORTANT: UPDATE THIS FILE AFTER COMPLETING EACH MAJOR SUBTASK ⚠️

This file should be updated by the AI assistant after completing each subtask from the DEVELOPMENT_ROADMAP.md to maintain an accurate picture of the current project structure.

---

## Current Status
**Last Updated:** 2025-07-23
**Current Phase:** Phase 4: Data Management  
**Completed Tasks:** Task 1.1 ✓, Task 1.2 ✓, Task 1.3 ✓, Task 2.1 ✓, Task 2.2 ✓, Task 2.3 ✓, Task 3.1 ✓, Task 3.2 ✓, Task 3.3 ✓, Task 4.2 ✓

---

## Project Structure
```
picky/
├── App.tsx                 # Main app component
├── index.ts               # Entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── assets/               # Static assets (icons, splash)
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── locales/              # Internationalization
│   └── it.json           # Italian locale strings
├── app/                  # Expo Router file-based routing
│   ├── _layout.tsx       # Root layout
│   └── (tabs)/           # Tab navigation group
│       ├── _layout.tsx   # Tab layout with Italian labels
│       ├── index.tsx     # Pulizia (Cleanup) screen
│       ├── statistics.tsx # Statistiche screen  
│       └── settings.tsx  # Impostazioni screen
├── components/           # Reusable UI components
│   ├── PermissionRequest.tsx # Media library permission flow
│   ├── AlbumPicker.tsx   # Album selection modal with smart detection
│   ├── MediaLoader.tsx   # Media preview and loading component
│   ├── SwipeCard.tsx     # Individual swipeable media card with gestures
│   ├── SwipingInterface.tsx # Complete swiping experience with stats
│   ├── TrashManager.tsx  # Complete trash management interface with grid view
│   └── UI/               # Theme-based UI components
│       ├── index.ts      # Component exports
│       ├── ThemedText.tsx # Typography component
│       ├── Button.tsx    # Button component
│       ├── Card.tsx      # Card component
│       └── SafeContainer.tsx # Safe area wrapper
├── hooks/                # Custom React hooks
│   ├── useMediaLibraryPermissions.ts # Permission management
│   └── useMediaLoader.ts  # Media loading and pagination state
├── services/             # Business logic services
│   ├── MediaLibraryService.ts # Media library wrapper
│   ├── StorageService.ts   # AsyncStorage wrapper for data persistence
│   └── SwipeActionsService.ts # Core swipe actions and business logic
├── constants/            # App constants and theme
│   ├── Colors.ts         # Color palette
│   ├── Typography.ts     # Typography system
│   ├── Spacing.ts        # Spacing and layout
│   └── Theme.ts          # Complete theme config
├── utils/               # [TO BE CREATED]
└── types/              # [TO BE CREATED]
```

## Installed Dependencies
```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "expo": "~53.0.20",
    "expo-av": "^15.1.7",
    "expo-haptics": "^14.1.4", 
    "expo-media-library": "^17.1.7",
    "expo-router": "^5.1.4",
    "expo-status-bar": "~2.2.3",
    "react": "19.0.0",
    "react-native": "0.79.5",
    "react-native-gesture-handler": "^2.27.2",
    "react-native-reanimated": "^3.19.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.0.10",
    "typescript": "~5.8.3"
  }
}
```

## Key Components
<!-- Update this section as components are created -->

### Navigation Components
- [ ] Not yet implemented

### UI Components
- [ ] Not yet implemented

### Feature Components
- [ ] Not yet implemented

## State Management
<!-- Document state management approach once implemented -->
- Storage solution: [Not yet decided]
- State structure: [Not yet defined]

## API/Service Layer
<!-- Document service architecture once created -->
- MediaLibrary Service: [Not implemented]
- Storage Service: [Not implemented]
- Analytics Service: [Not implemented]

## Styling Approach
<!-- Document styling decisions -->
- Theme: [Not yet defined]
- Component library: [Not yet chosen]

## Performance Optimizations
<!-- Track optimizations as they're implemented -->
- [ ] Image caching: Not implemented
- [ ] Lazy loading: Not implemented
- [ ] Memory management: Not implemented

## Testing Strategy
<!-- Document testing approach -->
- Unit tests: [Not set up]
- Integration tests: [Not set up]
- E2E tests: [Not set up]

## Build Configuration
<!-- Track build setup -->
- EAS Build: [Not configured]
- Environment variables: [Not set up]
- App signing: [Not configured]

## Known Issues / Tech Debt
<!-- Track issues as discovered -->
- ✅ **RESOLVED**: iOS ph:// URLs not supported in React Native Image/Video components
  - **Issue**: iOS Photos URIs (ph://...) caused "No suitable URL request handler" errors
  - **Solution**: Implemented automatic URI resolution using MediaLibrary.getAssetInfoAsync()
  - **Impact**: All photo/video previews now work correctly on iOS devices

## Architecture Decisions
<!-- Document major architectural decisions and rationale -->

### Why Expo?
- Live testing with Expo Go
- Simplified build process
- Cross-platform from single codebase

### Data Storage Approach
- [To be decided and documented]

### State Management Choice
- [To be decided and documented]

---

## Update Log
<!-- AI should add entries here after each subtask -->

### 2025-07-22 - Task 1.1 Completed
- Created Expo project with TypeScript template
- Installed core packages: expo-media-library@17.1.7, expo-av@15.1.7, expo-haptics@14.1.4
- Configured app.json with Italian app name "Picky", bundle IDs, and media permissions
- Set up Italian localization with locales/it.json
- Successfully tested blank app startup with Expo Go
- Key decisions: Used Italian permission descriptions, configured bundle ID as com.mattia.picky
- Next steps: Begin Task 1.2 - Navigation Structure

### 2025-07-22 - Task 1.2 Completed
- Installed expo-router@5.1.4 and @expo/vector-icons@14.1.0 for navigation
- Created file-based routing structure with app/ directory
- Built three tab screens: Pulizia (Cleanup), Statistiche, Impostazioni
- Implemented bottom tab navigation with Italian labels and Ionicons
- Configured proper tab bar styling and navigation persistence
- Key decisions: Used expo-router for modern React Native navigation, Ionicons for consistency
- Next steps: Begin Task 2.1 - Permissions & Access

### 2025-07-22 - Task 2.1 Completed
- Created comprehensive MediaLibraryService wrapper for expo-media-library
- Built useMediaLibraryPermissions hook for permission state management
- Developed PermissionRequest component with Italian permission flow
- Implemented graceful handling of denied permissions with Settings deep link
- Added error handling and loading states throughout permission flow
- Integrated permission system into Pulizia screen
- Key decisions: Singleton pattern for MediaLibraryService, comprehensive error handling
- Next steps: Begin Task 1.3 - Basic UI Theme

### 2025-07-22 - Task 1.3 Completed
- Created comprehensive theme system with dark background, purple/yellow accents
- Built Colors.ts with modern Apple-style color palette
- Developed Typography.ts with SF Pro font system and Italian character support
- Created Spacing.ts following 8pt grid system with consistent spacing values
- Built reusable UI components: ThemedText, Button, Card, SafeContainer
- Updated all existing screens to use new theme system
- Implemented modern, playful design with proper contrast and accessibility
- Key decisions: Dark theme with purple (#8B5FBF) and yellow (#FFD60A) accents, SF Pro typography
- Next steps: Begin Task 2.2 - Album Loading

### 2025-07-22 - Task 2.2 Completed
- Extended MediaLibraryService with smart album detection and sorting
- Added 5-minute caching system for album data to improve performance
- Implemented priority-based sorting: smart albums (WhatsApp, Screenshots, etc.) first, then by photo count
- Created AlbumPicker component with Italian localization and modern bottom-sheet design
- Integrated album selection into Pulizia screen with elegant UI flow
- Added Italian strings for album picker functionality
- Support for "All Photos" option and individual album selection
- Smart album detection for common album types (WhatsApp, Screenshots, Selfies, etc.)
- Key decisions: 5-minute album caching, priority-based sorting, bottom-sheet modal design
- Next steps: Begin Task 2.3 - Photo/Video Loading

### 2025-07-22 - Task 2.3 Completed
- Enhanced MediaLibraryService with advanced media loading capabilities
- Added getMediaAssets method with flexible filtering, sorting, and pagination options
- Implemented iCloud photo detection and download progress tracking
- Created MediaLoader component with grid preview layout for photos and videos
- Built useMediaLoader hook for managing media loading state and navigation
- Added video support with expo-av including autoplay, duration display, and audio capability
- Integrated media loading into Pulizia screen with preview interface
- Added file size display with Italian number formatting
- Cloud status indicators for iCloud photos requiring download
- Comprehensive error handling and loading states throughout media pipeline
- **BUGFIX**: Fixed iOS ph:// URL handling by automatically resolving to local URIs
- Added per-asset loading states and error handling for media previews
- Optimized preview rendering with React.memo for better performance
- Key decisions: 50-item default page size, grid preview layout, automatic iCloud download
- Next steps: Begin Task 3.1 - Swipe Card Component

### 2025-07-22 - Task 3.1 Completed
- Installed react-native-gesture-handler and react-native-reanimated for advanced animations
- Created SwipeCard component with full gesture support and smooth animations
- Implemented Tinder-like swipe detection for left (delete), right (keep), and up (favorites)
- Built SwipingInterface component with progress tracking and statistics
- Added real-time visual feedback for swipe directions with colored overlays
- Integrated haptic feedback for swipes and milestone achievements
- Created complete swiping flow in Pulizia screen with album navigation
- Added comprehensive error handling and loading states for swiping interface
- Implemented automatic asset URI resolution for iOS ph:// compatibility
- Built progress bar, statistics display, and completion celebration
- Added Italian instructions and feedback throughout swiping experience
- Key decisions: 90% screen width cards, 25% screen width swipe threshold, milestone haptics
- Next steps: Begin Task 3.2 - Media Display

### 2025-07-23 - Task 3.2 Completed
- Enhanced photo rendering with intelligent aspect ratio calculations for optimal display
- Improved video player with better autoplay, looping, and audio support
- Added comprehensive orientation handling for portrait, landscape, and square media
- Implemented detailed loading states with progress indicators for both initial load and content rendering
- Enhanced error states with media dimension information and Italian error messages
- Added separate loading states for images vs videos with appropriate feedback
- Improved video playback with status monitoring and seamless looping
- Optimized media sizing to maintain aspect ratios while fitting within card constraints
- Added iCloud download progress indicators with Italian messaging
- Enhanced visual feedback with content loading overlays and error details
- Key decisions: Dynamic media sizing based on aspect ratio, separate loading states for URI vs content
- Next steps: Begin Task 3.3 - Swipe Actions

### 2025-07-23 - Task 3.3 Completed
- Installed @react-native-async-storage/async-storage@2.2.0 for persistent data storage
- Created comprehensive StorageService for managing trash, favorites, swipe history, and statistics
- Built SwipeActionsService to handle all swipe action business logic with proper error handling
- Implemented complete swipe action functionality: keep (statistics only), trash (in-app storage), favorites (in-app collection)
- Added intelligent haptic feedback system with different intensities for different actions and milestones
- Built full undo functionality with ability to reverse last swipe action and return to previous card
- Enhanced SwipingInterface with real-time action feedback and undo button in header
- Added comprehensive error handling and Italian messaging throughout swipe actions
- Implemented milestone detection with special haptic feedback every 10, 50, and 100 items
- Created persistent data structures for trash management, favorites collection, and statistics tracking
- Key decisions: In-app data storage (not system delete), comprehensive undo system, milestone-based feedback
- Next steps: Begin Phase 4 - Data Management (Task 4.2 - Trash System)

### 2025-07-23 - Task 4.2 Completed (Trash System)
- Created comprehensive TrashManager component with grid view for deleted items
- Built complete trash management UI with photo/video previews, deletion dates, and file sizes
- Implemented individual item restoration with confirmation dialogs and haptic feedback
- Added empty trash functionality with system confirmation and batch deletion
- Enhanced Statistics screen with complete trash section showing count, size, and management interface
- Integrated real-time statistics tracking with ranking system (Novizio → Principiante → Bronzo → Argento → Oro)
- Added automatic global statistics updates in SwipeActionsService for all actions
- Built comprehensive error handling and Italian messaging throughout trash system
- Fixed all TypeScript compilation errors and ensured full Expo compatibility
- Successfully tested app compilation and export process
- Key decisions: Grid-based trash preview, in-place restoration, real-time statistics updates
- Next steps: Begin Task 4.1 - Progress Tracking or Task 4.3 - Favorites Collection