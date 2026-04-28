# Implementation Plan: Module 3 - How Votes Are Counted

This plan outlines the integration of the final learning module ("How Votes Are Counted") into BallotBuddy V2.0, focusing on EVM/VVPAT architecture, timeline visualization, interactive transparency features, and myth-busting.

## User Review Required

Please review the proposed steps and mini-game logic. If approved, I will implement this module and make it the "final boss" of the learning journey.

## Open Questions

> [!NOTE]
> **Mini-game complexity:** For the "Verification Match" mini-game, I plan to build a simple interactive component where users must click "Match" when the EVM count (e.g., 450) matches the VVPAT slip count (e.g., 450) to proceed, simulating the manual VVPAT matching process. Is this simple interaction acceptable for the hackathon?

## Proposed Changes

### 1. State Management for Module 3
Extend the existing module state machinery to support Module 3.

#### [MODIFY] `src/pages/LearningModules.jsx`
- Add `moduleThreeStep` state to track progress through the new module.
- Add `advanceModuleThree` function to handle step transitions and update `ProgressContext` upon completion (adding the final chunk to the Democracy Score).

### 2. Module 3 Modal UI (4-Step Flow)
Inside the `selectedModule === 3` modal, implement the following steps:

#### Step 1: Anatomy of the Count
- Visual breakdown of the **Control Unit (CU)**, **VVPAT Slip**, and **Security Seals** (Pink Paper Seals).
- Use Lucide icons (`Cpu`, `FileText`, `Lock`) to represent each hardware component.

#### Step 2: Counting Timeline
- A vertical timeline component.
- Nodes:
  - Transport & Strongroom (Multi-tier security)
  - Opening the Seals (In front of polling agents)
  - Result Button Press (Revealing totals)
  - Mandatory VVPAT Verification (Random 5 stations)

#### Step 3: Interactive Transparency (Mini-Games)
- **Agent Simulator:** User must click a "Verify Seal is Intact" button before the machine can be opened.
- **Verification Match:** A mini-game showing an EVM digital total and a pile of VVPAT slips. The user must click to "count" the slips and verify they match the digital total.
- **Form 17C:** Introduce Form 17C as the ultimate receipt.

#### Step 4: Myth-Busting
- FAQ style cards addressing common concerns:
  - EVM Bluetooth/Wireless Hacking (EVMs are standalone, no wireless).
  - Power Outages (EVMs run on standalone batteries).
- Final Boss completion screen: "100% Election Ready!"

### 3. Visuals & Styling
- Add a CSS diagram layout for the Balloting Unit -> VVPAT -> Control Unit flow in Step 1.
- Update `LearningModules.css` with specific classes for the mini-game (e.g., `.slip-pile`, `.verification-match`).

## Verification Plan

### Manual Verification
1. I will complete Module 2 to unlock Module 3.
2. I will walk through all 4 steps of Module 3.
3. I will test the Verification Match mini-game logic.
4. I will verify that completing the module pushes the Democracy Score to maximum and marks the user as "Election Ready".
