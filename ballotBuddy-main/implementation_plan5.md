# Replace Simulation with News and Embed EVM Simulation in Module 2

The goal is to replace the current "Simulate" section with a dedicated "News" feed for election updates, and move the entire EVM Simulation interactive component into Module 2 of the "Learn" section. 

## Proposed Changes

### 1. Routing and Navigation
- **`App.jsx`**: 
  - [MODIFY] Replace the `/simulation` route with a new `/news` route.
- **`AppLayout.jsx`**:
  - [MODIFY] Update the bottom navigation bar to replace the "Simulate" (Vote icon) tab with a "News" (Newspaper icon) tab linking to `/news`.
- **`HomeDashboard.jsx`**:
  - [MODIFY] Update the "Explore" grid section to replace the "Simulate" card with a "News" card.

### 2. Create News Section
- **`src/pages/NewsFeed.jsx`**:
  - [NEW] Create a new component displaying a feed of election-related news. This will include mock news cards with titles, sources, timestamps, and brief summaries, utilizing a clean, modern UI.

### 3. Embed EVM Simulation in Module 2
- **`LearningModules.jsx`**:
  - [MODIFY] Update Module 2's structure. Instead of just static text explaining the EVM compartment in Step 3, we will directly render the `<MockSimulation />` component here.
- **`MockSimulation.jsx`**:
  - [MODIFY] Add an `embedded` prop or similar mechanism to handle completion and "back" actions gracefully. When embedded, the simulation shouldn't trigger top-level navigation via `react-router`, but instead call callback functions (like `onComplete`) to advance the module timeline within `LearningModules.jsx`.

## User Review Required

> [!IMPORTANT]  
> Are there any specific types of news categories or sources you want to see mocked in the News section (e.g., Fact Checks, ECI Announcements, General News)?

## Verification Plan
1. **Automated/Manual Tests**:
   - Verify the bottom navigation correctly links to the new News Feed.
   - Ensure the new News Feed renders correctly with dark mode support.
   - Start Module 2 in the Learn section and ensure the EVM Simulation successfully boots up within the modal.
   - Verify that completing the simulation from inside Module 2 properly updates progress and unlocks Module 3.
