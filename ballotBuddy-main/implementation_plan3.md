# Implementation Plan: BallotBuddy V2.0

This plan outlines the execution strategy for BallotBuddy V2.0, focusing on transforming the app from an information aggregator into a highly functional, interactive, and trustworthy civic utility.

## User Review Required

Please review the proposed architectural changes below. If you approve, I will begin execution by creating a task list and working through the sprints.

## Open Questions

> [!WARNING]
> **API Limitations:**
> 1. Real ECI APIs (Voter Registration Status, Candidate Lists) are not publicly open for CORS web access. I will simulate these endpoints realistically (e.g., entering a 10-digit mock Reference ID will show a simulated tracking timeline). Is this acceptable for the hackathon demo?
> 2. For the "Verify" tab OCR, we already installed `tesseract.js`. I will integrate this into the Verify tab to allow image uploads of WhatsApp forwards. I will simulate the LLM backend response since we do not have a live Gemini API key configured in the browser. Is a realistic simulated LLM response acceptable?

## Proposed Changes

### 1. Global State & Dynamic Scoring (React Context)
To link the Democracy Score to actual milestones and strictly enforce the "Continue" button logic, we need a global state manager.

#### [NEW] `src/context/ProgressContext.jsx`
- Create a React Context to manage:
  - `democracyScore` (Starts at 0 or a base level, progresses to 1000 "Election Ready")
  - Module completion statuses
  - Badges and unlocked features

#### [MODIFY] `src/pages/HomeDashboard.jsx`
- Connect the Democracy Score UI to the `ProgressContext`.
- Add dynamic CTAs based on the user's score (e.g., if Registration isn't done, show "Track your Voter ID" instead of "Learn").

### 2. Functional Simulation: VVPAT & Error Scenarios
The Mock EVM will be upgraded to match real-world Booth troubleshooting and verification.

#### [MODIFY] `src/pages/MockSimulation.jsx`
- **VVPAT Animation:** After voting, trigger a 7-second animation of a printed slip appearing behind a "glass" UI element before fading away with a beep.
- **Error Scenarios:** Introduce a "Low Battery" red LED state and a "Close Button Pressed" state to educate users on what happens when the booth malfunctions or the officer prematurely ends the session.

### 3. Combatting Misinformation: OCR "Verify" Tab
We will upgrade the `VerifyNews.jsx` tab to accept image uploads.

#### [MODIFY] `src/pages/VerifyNews.jsx`
- Add an Image Upload drag-and-drop zone.
- Integrate `tesseract.js` to extract text from screenshots of WhatsApp forwards.
- Pass the extracted text into our existing AI Fact-Checker simulation to output a "Trust Score" and simulated ECI clarification links.

### 4. Accessibility & Universal Design
In civic tech, accessibility is paramount.

#### [MODIFY] `src/layouts/AppLayout.jsx`
- Add a "High Contrast Mode" toggle button next to the language selector. This will inject a `.high-contrast` class to the body.
- Add an "Audio Guide" toggle. When active, it will use the Web Speech API (`window.speechSynthesis`) to narrate key headers and instructions on the screen.

#### [MODIFY] `src/index.css`
- Define `.high-contrast` CSS variables (pure black/white, thick borders, yellow highlights).

### 5. Registration Status Tracker
A utility for users to track their Form 6 application.

#### [NEW] `src/components/StatusTracker.jsx`
- A component simulating the ECI reference ID tracking.
- Input: 12-character Reference ID.
- Output: A 4-step vertical stepper (Submitted -> BLO Appointed -> Verified -> EPIC Generated).

#### [MODIFY] `src/pages/RegistrationGuide.jsx`
- Integrate the `StatusTracker.jsx` into the Registration Guide as a new tab or section.

## Verification Plan

### Automated/Manual Verification
- **VVPAT Sequence:** I will verify the 7-second timing and visual appearance of the VVPAT slip.
- **Scoring Engine:** I will complete a module and verify that the context successfully increments the Democracy Score globally across all pages.
- **Accessibility:** I will test the Web Speech API narration and the High Contrast CSS overrides.
- **OCR:** I will verify that uploading an image successfully runs Tesseract and populates the Verify input field.
