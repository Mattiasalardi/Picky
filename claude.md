# Claude Code Memory File - Picky App

## 🚨 ALWAYS READ BEFORE STARTING ANY WORK 🚨

Before beginning ANY task or responding to ANY request about this project, you MUST:

1. **Read PROJECT_CONTEXT.md** - Contains complete app description and requirements
2. **Read PROJECT_ARCHITECTURE.md** - Shows current state of the codebase
3. **Read DEVELOPMENT_ROADMAP.md** - Contains all tasks and subtasks

## Critical Project Rules

### 1. Development Environment
- **ALWAYS** use Expo with TypeScript
- **ALWAYS** ensure compatibility with Expo Go for testing
- **NEVER** use native modules that break Expo Go compatibility

### 2. Language Requirements
- **ALL** user-facing text must be in Italian
- **NO** English text in the UI (comments in code can be English)
- Use proper Italian formatting for numbers (e.g., "2,3 MB" not "2.3 MB")

### 3. Code Standards
- Create code that works immediately in Expo Go
- Test all features assuming they'll be run via Expo Go
- Use TypeScript for type safety
- Follow the file structure defined in PROJECT_ARCHITECTURE.md

### 4. After Completing Each Subtask
You MUST update PROJECT_ARCHITECTURE.md with:
- New files/folders created
- Packages installed (with exact versions)
- Components built
- Architectural decisions made
- Current implementation status

### 5. Task Execution Order
- Follow DEVELOPMENT_ROADMAP.md sequentially
- Complete all subtasks within a task before moving to the next
- Check off completed items using [x] in the roadmap

### 6. Key Technical Decisions Already Made
- In-app trash system (not system trash)
- Picky Favorites stored as photo IDs in AsyncStorage
- Progress tracking per album
- "Nuove foto" popup on app launch
- Videos autoplay with sound

### 7. UI/UX Principles
- Gamified and addictive experience
- Premium App Store aesthetic
- Smooth animations (60fps)
- Haptic feedback for interactions
- Confetti and celebrations for milestones

## Working Directory Structure
Always assume these files exist in the project root:
- /PROJECT_CONTEXT.md
- /PROJECT_ARCHITECTURE.md  
- /DEVELOPMENT_ROADMAP.md
- /claude.md (this file)

## Example Workflow
1. User asks: "Build the swipe card component"
2. You read all .md files
3. Find the relevant task in DEVELOPMENT_ROADMAP.md
4. Check PROJECT_ARCHITECTURE.md for current state
5. Build according to PROJECT_CONTEXT.md requirements
6. Update PROJECT_ARCHITECTURE.md after completion

## Remember
- This is an Italian-only app
- Must work with Expo Go
- Follow the roadmap sequentially
- Update architecture docs after each subtask
- Create beautiful, gamified, addictive UX