
# 🗳️ BallotBuddy

> **A civic education and voter registration platform** — making democratic participation accessible, verifiable, and transparent.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

**BallotBuddy** is a full-stack civic education web application that guides citizens through the voter registration process with a streamlined, step-by-step experience. It leverages in-browser OCR to verify government-issued IDs, tracks application progress in real time, and stores everything securely in a Supabase-powered backend — all wrapped in a progressive web app (PWA) that works on any device.

---

## ✨ Features

- **🪪 ID Verification via OCR** — Upload a government-issued ID and let Tesseract.js extract and validate text directly in the browser, with no server-side image processing required.
- **📋 Multi-Step Application Flow** — Guided registration form with granular progress tracking (`progress_step`) and persistent state across sessions.
- **🔐 Secure Authentication** — Supabase Auth handles sign-up, sign-in, and session management out of the box, Google Auth is supported that uses Google cloud Console(OAuth 2.0).
- **🛡️ Row-Level Security (RLS)** — Every database table enforces per-user access policies; users can only ever see and modify their own data.
- **📁 File Storage** — ID document images are uploaded directly to Supabase Storage with user-scoped paths.
- **📜 Activity Logging** — Every significant user action is logged with metadata, providing a clear audit trail.
- **📱 Progressive Web App** — Installable on desktop and mobile with offline capability via `vite-plugin-pwa`.
- **🔗 Client-Side Routing** — Smooth navigation with React Router DOM v7.
- **📰 News Display Feature** — Has a Completely independent feature of displaying Updated and Well Researched News Using News-API, Which helps user to identify correctly which news is original and which is fake.
- **🚀 Deployment** — Deployed the application on Google Cloud Run using a containerized backend built with Docker. Implemented a CI/CD pipeline with Google Cloud Build for automated builds and deployments. Used Express.js as the backend server to handle API requests, routing, and middleware management.
---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| Backend & Auth | Supabase (PostgreSQL + Auth + Storage), Google Cloud Console(OAuth 2.0)|
| OCR Engine | Tesseract.js 7 |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Linting | ESLint 10 |
| Deployment | Google Cloud Run(Cloud Run API, Cloud Build API), Docker Container, Express JS | 
---

## 🗃️ Database Schema

BallotBuddy uses four PostgreSQL tables in Supabase, all protected by Row-Level Security.

### `profiles`
Extends `auth.users`. Stores each user's display info and verification status.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | References `auth.users.id` |
| `username` | TEXT (unique) | Display name |
| `email` | TEXT | Contact email |
| `phone` | TEXT | Contact phone |
| `is_verified` | BOOLEAN | Whether the user's ID has been verified |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |

### `id_submissions`
Tracks every ID document upload and its OCR/verification result.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Submission identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `image_url` | TEXT | Public URL of uploaded ID image |
| `extracted_text` | TEXT | OCR output from Tesseract.js |
| `detected_type` | TEXT | Type of ID detected |
| `verification_status` | TEXT | `pending`, `valid`, or `invalid` |
| `retry_count` | INT | Number of re-submission attempts |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

### `applications`
Represents a voter registration application and its multi-step progress.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Application identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `reference_id` | TEXT (unique) | Auto-generated reference (`OJA` + random digits) |
| `full_name` | TEXT | Applicant full name |
| `dob` | DATE | Date of birth |
| `address` | TEXT | Residential address |
| `status` | TEXT | `draft`, `submitted`, etc. |
| `progress_step` | INT | Current step in the registration flow |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### `activity_logs`
Immutable audit trail of all user actions.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Log entry identifier |
| `user_id` | UUID (FK) | References `profiles.id` |
| `action` | TEXT | Action name (e.g., `uploaded_id`) |
| `metadata` | JSONB | Contextual data (e.g., `submission_id`) |
| `created_at` | TIMESTAMPTZ | Timestamp of action |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [Supabase](https://supabase.com/) project with the schema below applied

### 1. Clone the Repository

```bash
git clone https://github.com/Aryan-cooks/ballotBuddy.git
cd ballotBuddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/).
2. In the SQL editor, run the full schema from [`supabase_schema_docs.md`](./supabase_schema_docs.md) to create tables, RLS policies, indexes, and triggers.
3. Create a **Storage bucket** named `ids` and set it to public (or configure RLS as needed).

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## 📂 Project Structure

```
ballotBuddy/
├── public/                     # Static assets
├── src/                        # Application source code
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Route-level page components
│   ├── lib/                    # Supabase client & utilities
│   └── main.jsx                # App entry point
├── supabase_schema_docs.md     # Full DB schema & integration guide
├── CivicEducationPlatform_PRD.docx  # Product Requirements Document
├── index.html                  # HTML entry point
├── vite.config.js              # Vite & PWA configuration
└── package.json                # Project metadata & dependencies
```

---

## 🔐 Security

- All Supabase tables are protected by **Row-Level Security (RLS)**. A user can only read, insert, or update their own rows.
- Indexes are created on `user_id`, `reference_id`, `verification_status`, and `created_at` for query performance.
- A PostgreSQL trigger auto-creates a `profiles` row on every new auth registration.
- Sensitive credentials must be kept in `.env` and never committed to version control.

---


**Built with ❤️ to make civic participation more accessible.**
