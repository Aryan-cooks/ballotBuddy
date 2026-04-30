# BallotBuddy - Phase 2 (Hackathon Polish) Implementation Plan

This plan addresses the critical feedback to elevate BallotBuddy from a standard React app to a technically complex, highly personalized, and competition-winning prototype.

## User Review Required
> [!IMPORTANT]
> Please review this plan. Adding Tesseract.js (OCR) and Vite PWA will introduce new dependencies. 
> For the "AI Fact-Checking", should we build a highly realistic *simulated* AI response for the frontend demo, or do you want to provide an actual API key (like OpenAI/Gemini) to make live API calls? (I recommend a realistic simulation for the frontend demo to avoid API key exposure/rate limits during judging, but let me know your preference!)

## Open Questions
- Do you want the language toggle to actually translate the entire app, or just demonstrate the capability on the Home Dashboard for the prototype? (Fully translating requires setting up `react-i18next` and translation JSON files for all text).

## Proposed Changes

### 1. The "So What?" Factor (Value Proposition)
#### [MODIFY] `src/pages/VerifyNews.jsx`
- Replace the static quiz with an "AI Fact Checker" interface.
- Add an input area for users to paste questionable news.
- Implement a realistic "AI Analysis" loading state that breaks down the text, checks sources, and provides a "Misinformation Probability Score" and detailed explanation.

#### [MODIFY] `src/pages/MockSimulation.jsx`
- Integrate `navigator.vibrate([200, 100, 200])` to provide physical haptic feedback when clicking the EVM buttons (works on Android/supported mobile browsers).
- Enhance the visual cues to be more urgent and realistic.

---

### 2. UI/UX: The "Empty Room" Problem
#### [MODIFY] `src/pages/HomeDashboard.jsx`
- **Personalization:** Add a "Voter Profile Setup" modal on first visit asking for their Zip Code/State.
- **Countdown Timer:** Replace the massive "Hello" with a dynamic widget showing "Days until next election in [State]".
- **Democracy Score:** Convert the static icons into a "Democracy Score" progress ring (e.g., "Score: 850 - Civic Scholar").

---

### 3. Technical Depth (OCR Integration)
#### [NEW] `src/pages/IDScanner.jsx`
- Create a new route/component for scanning Voter IDs.
- Integrate `tesseract.js` to process an uploaded/captured image.
- Extract text (Name, DOB) from the image and simulate an "Electoral Roll Database Check".
#### [MODIFY] `src/pages/RegistrationGuide.jsx`
- Link the OCR scanner as a step before redirecting to the government portal.

---

### 4. Accessibility and Trust
#### [MODIFY] `src/layouts/AppLayout.jsx`
- Add a Language Toggle dropdown (e.g., EN, HI, ES) in the top header.
#### [MODIFY] `src/pages/HomeDashboard.css`
- Improve the color contrast of the "Up Next" card subtext (`text-white-muted`) to ensure it passes WCAG AA accessibility standards.
#### [MODIFY] `vite.config.js` & [NEW] `public/manifest.json`
- Install and configure `vite-plugin-pwa`.
- Set up service workers to cache the static assets so the app works in Offline Mode (crucial for voting booths).

## Verification Plan

### Automated/Manual Tests
- **OCR Test:** Upload a sample ID image and verify `tesseract.js` extracts text and updates state.
- **PWA Test:** Build the app, run the preview server, and simulate offline mode in Chrome DevTools to ensure the dashboard and simulation still load.
- **Haptics Test:** Verify `navigator.vibrate` is called on button clicks (via browser console/mobile testing).
- **Contrast Check:** Run Lighthouse accessibility audit on the Dashboard to ensure the new text colors pass.
