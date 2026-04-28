# Goal Description

Redesign the `Login` and `Register` pages from scratch to modernize the user authentication flow, while keeping the rest of the application completely untouched.

The Login page will focus on a clean, phone-number-only flow.
The Register page will support a comprehensive, two-step verification process (Phone OTP and Aadhar OTP).

## User Review Required

- **Routing / Navigation:** Since we are not touching `App.jsx` or other components, the new components will be named `Login` and `Register` and placed in the same file paths (`src/pages/Login.jsx` and `src/pages/Register.jsx`) so that all existing routes continue to work seamlessly.
- **Visual Design:** The design will inherit the existing `index.css` global theme variables (`--primary-blue`, `--bg-color`, `--surface-color`) to ensure it looks consistent with the home page, while adopting the minimal form styling referenced previously (floating transparent inputs on the page, or clean minimal boxes).

## Proposed Changes

### Authentication Pages

#### [DELETE] `src/pages/Login.jsx`
#### [DELETE] `src/pages/Login.css`
#### [NEW] `src/pages/Login.jsx`
- Clean, minimal component that only asks for **Phone Number**.
- "Get OTP" button that handles the submission.
- Once OTP is requested, it will show an OTP input field for verification.

#### [NEW] `src/pages/Login.css`
- Minimalist CSS to style the new login page, utilizing existing theme tokens without heavy box shadows or borders.

#### [DELETE] `src/pages/Register.jsx`
#### [DELETE] `src/pages/Register.css`
#### [NEW] `src/pages/Register.jsx`
- Multi-step or comprehensive registration form containing:
  1. **Name** (As per Aadhar card)
  2. **Phone Number**
  3. **Phone Number OTP** (Shows after requesting phone OTP)
  4. **Aadhar Card Number**
  5. **Aadhar Card OTP** (Shows after requesting Aadhar OTP)
- Include logic to validate phone and Aadhar numbers, mock sending OTPs, and verifying them.

#### [NEW] `src/pages/Register.css`
- Styling for the registration form, matching the new minimal aesthetic of the Login page.

## Verification Plan

### Automated Tests
- Run `npm run dev` and navigate to `/login` to verify the new Login page renders and the Phone Number -> OTP flow works.
- Navigate to `/signup` or `/register` to verify the Registration page renders and correctly captures Name, Phone (with OTP), and Aadhar (with OTP).

### Manual Verification
- Ensure no other files were modified in the Git working directory.
- Verify that responsive design behaves correctly on mobile viewport sizes.
