# Dead Poets Society

A modern literary platform built for a community of poets to compose, discover, critique, and preserve poetry. Built with Next.js, Tailwind CSS, and Supabase, Dead Poets Society combines a distinctive Dark Academia aesthetic with interactive social features, rich text editing, and granular moderation workflows.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture and Technical Highlights](#architecture-and-technical-highlights)
4. [Technology Stack](#technology-stack)
5. [Repository Directory Structure](#repository-directory-structure)
6. [Quick Start Guide](#quick-start-guide)
7. [Database and Backend Setup](#database-and-backend-setup)
8. [Documentation Index](#documentation-index)
9. [Contributing](#contributing)
10. [License](#license)
11. [Future Plans](#future-plans)

---

## Overview

Dead Poets Society provides an editorial sanctuary for writers. The platform prioritizes typographic craftsmanship, whitespace preservation for complex verse structures, and engaging reader interactions. Poets can publish their work through a peer-reviewed submission queue, engage with fellow writers via applauses and bookmarks, and share verses through generated graphic cards.

---

## Key Features

### 1. Editorial Reading and Dark Academia Interface

- Designed with a warm monochrome palette: obsidian and deep stone surfaces, aged gold typography, and wax-red accents.
- Responsive handwritten parchment cards for poem browsing, complete with tactile animations via Framer Motion.
- Distinctive typography using Cinzel for classical headings, serif fonts for literary prose, and handwriting scripts for card previews.

### 2. Rich Text Composition and Verse Formatting

- Full Tiptap editor engine supporting bold, italic, underline, paragraph alignment, and explicit stanza break handling.
- Specialized poem rendering pipeline that preserves whitespace and intentional stanza gaps without collapsing lines.
- Client-side HTML sanitization using DOMPurify to guarantee security against cross-site scripting.

### 3. Community and Social Engagement

- Atomic Applause: Readers can applaud poems they love, powered by atomic PostgreSQL procedures that eliminate race conditions.
- Bookmarks Collection: Users can save poems directly from feeds or poem pages into their personal bookmarks tab.
- Poet Network: Follow and unfollow capabilities with follower and following roll dialogs.
- Shareable Quote Graphic Generator: Readers can highlight any stanza of a poem to generate a 600x600 social quote card featuring the excerpt, poem details, and a high-resolution QR code linking back to the verse.

### 4. Moderation and Administrative Console

- Multi-tab admin console for managing published poems, reviewing the pending submissions queue, and managing community roles.
- Multi-tier role permissions: Standard User, Semi-Admin (content moderator), and Master Administrator.
- Integrated review workflow: Admins can review, approve, edit, or reject submitted verses.

### 5. Seamless Onboarding and Identity

- Authentication via Google OAuth through Supabase Auth.
- Automatic profile creation on sign-up with client-side image compression (resizing avatars to under 200 KB in Web Workers).
- Mandatory onboarding guard redirecting new users to configure their identity before navigating community spaces.

---

## Architecture and Technical Highlights

- Hybrid Rendering: Dynamic routes leverage Server-Side Rendering (SSR) for fast initial paint and metadata, paired with client views for interactive state.
- Decoupled View Architecture: Clean separation between Next.js App Router entry points (`src/app/*`) and rich client view controllers (`src/views/*`).
- PostgreSQL Row Level Security: Strict database-level security policies protecting user profiles, private submissions, bookmarks, and admin privileges.
- Automated Maintenance: Scheduled PostgreSQL ping job via `pg_cron` running every 3 days to prevent Supabase free-tier project pauses.

For comprehensive architectural design, refer to the [Architecture Documentation](docs/Architecture.md).

---

## Technology Stack

### Frontend

- Framework: Next.js 16 (App Router, Turbopack, React 19)
- Styling: Tailwind CSS, Tailwind Animate, Tailwind Typography
- UI Primitives: Radix UI primitives with custom Dark Academia styling
- Animations: Framer Motion
- Rich Text Editor: Tiptap (StarterKit, Underline, TextAlign)
- Canvas and Graphics: html-to-image, qrcode.react
- Client Utilities: browser-image-compression, dompurify, lucide-react

### Backend and Infrastructure

- Database: PostgreSQL hosted on Supabase
- Authentication: Supabase Auth (Google OAuth provider)
- Storage: Supabase Storage (`pfp` public bucket with user-scoped folders)
- Database Automation: pg_cron extension
- Hosting and CI/CD: Vercel

---

## Repository Directory Structure

```
Dead-Poets-Society/
├── docs/
│   ├── Architecture.md         # Full system architecture, patterns, and data flow
│   ├── Database.md             # Complete SQL schema, RLS policies, RPCs, and cron
│   └── Setup.md                # Local development and deployment instructions
├── public/                     # Static assets (postIt.png, logo, default avatar)
├── src/
│   ├── app/                    # Next.js App Router page routes and global styles
│   │   ├── about/              # About us route
│   │   ├── admin/              # Admin dashboard route
│   │   ├── event/              # Club events and gatherings
│   │   ├── login/              # Authentication gateway
│   │   ├── note/[id]/          # Dynamic poem reader route
│   │   ├── poems/              # Browse poems catalog
│   │   ├── poets/              # Poet directory
│   │   ├── profile/[userId]/   # User profile and bookmarks route
│   │   ├── setup-profile/      # New user onboarding route
│   │   ├── submit/             # Poem submission form
│   │   ├── globals.css         # Theme styles and poem break CSS rules
│   │   └── layout.js           # Root layout with AuthProvider and ProfileGuard
│   ├── components/
│   │   ├── auth/               # Route guards (ProtectedRoute, ProfileGuard)
│   │   ├── common/             # Shared UI components (Bookmark, Applause, Editor)
│   │   ├── layout/             # Navigation, Hero, Footer, Social links
│   │   ├── modals/             # Dialogs (EditPoem, EditProfile, FollowList, ShareQuote)
│   │   ├── poems/              # Poem presentation (NoteCard, NotesGrid)
│   │   └── ui/                 # Headless UI primitives (Dialog, Tabs, Button, Card)
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state and realtime profile listener
│   ├── lib/
│   │   ├── constants.js        # Categorical poem tags and options
│   │   ├── poemFormatter.js    # Poem break preservation and sanitization helpers
│   │   └── utils.js            # Tailwind merge utilities
│   ├── supabase/
│   │   └── config.js           # Supabase client singleton
│   └── views/                  # Client view controllers corresponding to routes
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Theme colors, fonts, and responsive breakpoints
└── README.md                   # Project overview
```

---

## Quick Start Guide

### 1. Clone the repository

```bash
git clone https://github.com/BIJJUDAMA/Dead-Poets-Society.git
cd Dead-Poets-Society
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### 4. Start the development server

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

---

## Database and Backend Setup

The database requires PostgreSQL tables, Row Level Security policies, storage bucket configurations, and Remote Procedure Call (RPC) functions.

1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Open [docs/Database.md](docs/Database.md) in this repository.
3. Copy the entire script under **Consolidated Setup Script** and run it in the Supabase SQL Editor.
4. Enable Google OAuth under **Authentication** > **Providers** > **Google**.
5. For step-by-step guidance, refer to the [Setup and Deployment Guide](docs/Setup.md).

---

## Documentation Index

Detailed documentation is available in the `docs` directory:

- [Architecture Documentation](docs/Architecture.md): Deep-dive into application architecture, component relationships, data flow, formatting pipeline, and security model.
- [Database and SQL Reference](docs/Database.md): Complete schema documentation, column types, RLS policies, RPC stored procedures, and pg_cron keep-alive instructions.
- [Setup and Deployment Guide](docs/Setup.md): Prerequisites, environment variables, Google OAuth configuration, local testing, and Vercel deployment instructions.

---

## Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Ensure the project builds cleanly without errors:

   ```bash
   npm run build
   ```

4. Commit your changes following conventional commit syntax:

   ```bash
   git commit -m "feat: add feature description"
   ```

5. Push to your branch and submit a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Future Plans

- [X] Switch to Next JS
- [ ] Integrate with **Object Storage** for various medias. (like Backblaze B2)
- [X] Build an **Events Page** for showcasing club activities.
- [ ] Revamp **About Us Page** with dynamic team/year-wise structure.
- [ ] Introduce **Vellum and Paper Tint Options** allowing readers to switch between authentic paper surfaces (Weathered Parchment, Candlelit Sepia, Obsidian Velvet, or Oxford Vellum).
- [ ] Build a **Full-Screen Distraction-Free Study Mode** that fades navigation bars and UI chrome to focus entirely on verse.
- [ ] Provide **Print and Press Journal Export** for generating print-ready, high-resolution PDF leaflets formatted like classical literary press journals.
- [ ] Implement **Semantic and Mood-Based Search** using PostgreSQL pg_trgm fuzzy matching or vector embeddings (pgvector) to discover poems by theme, motif, and emotional tone.
