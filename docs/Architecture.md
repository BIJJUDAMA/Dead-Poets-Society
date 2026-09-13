# Architecture Documentation

This document describes the software architecture, design patterns, component relationships, data flows, and infrastructure for the Dead Poets Society application.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Frontend Architecture](#2-frontend-architecture)
   - [Next.js App Router Structure](#nextjs-app-router-structure)
   - [View Layer Decoupling Pattern](#view-layer-decoupling-pattern)
   - [Component Hierarchy](#component-hierarchy)
   - [Styling and Design System](#styling-and-design-system)
3. [Authentication and Authorization](#3-authentication-and-authorization)
   - [Google OAuth Integration](#google-oauth-integration)
   - [AuthContext Lifecycle](#authcontext-lifecycle)
   - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
   - [Route Protection and Onboarding Guards](#route-protection-and-onboarding-guards)
4. [Content Pipeline and Publishing Workflow](#4-content-pipeline-and-publishing-workflow)
   - [Poem Submission Flow](#poem-submission-flow)
   - [Admin Moderation Engine](#admin-moderation-engine)
   - [Publication and Author Management](#publication-and-author-management)
5. [Rich Text and Formatting Engine](#5-rich-text-and-formatting-engine)
   - [Tiptap Editor Integration](#tiptap-editor-integration)
   - [Stanza and Break Preservation](#stanza-and-break-preservation)
   - [Sanitization Pipeline](#sanitization-pipeline)
6. [Social Features and Interaction Systems](#6-social-features-and-interaction-systems)
   - [Atomic Applause System](#atomic-applause-system)
   - [Bookmark Collection System](#bookmark-collection-system)
   - [Followers Graph](#followers-graph)
   - [Shareable Quote Graphic Engine](#shareable-quote-graphic-engine)
7. [Media and Storage Architecture](#7-media-and-storage-architecture)
8. [Database and Scheduling Infrastructure](#8-database-and-scheduling-infrastructure)

---

## 1. High-Level Architecture

Dead Poets Society follows a modern web architecture decoupling client presentation, authentication, state management, and PostgreSQL database operations.

```
Client Browser
    │
    ├── Next.js Application (App Router, Turbopack, React 19)
    │       │
    │       ├── Route Handlers & Server Components (src/app/*)
    │       ├── View Layer (src/views/*)
    │       ├── Design System (Tailwind CSS, shadcn/ui)
    │       └── Global Context (AuthContext)
    │
    └── Supabase Backend Services
            │
            ├── Auth Engine (Google OAuth Provider)
            ├── PostgreSQL Database (RLS, Triggers, RPC Functions)
            ├── Object Storage (pfp Avatar Bucket)
            └── Maintenance Engine (pg_cron Scheduled Ping)
```

---

## 2. Frontend Architecture

### Next.js App Router Structure

The application uses the Next.js 16 App Router. Routing is defined within `src/app/`, mapping URLs to page endpoints:

- `/`: Home page displaying hero, curated collections, and slideshow.
- `/poems`: Browsable catalog with search, multi-tag filtering, and infinite scroll.
- `/poets`: Directory of active community poets.
- `/note/[id]`: Individual poem reading page with applause, bookmarking, and quote sharing.
- `/profile/[userId]`: User profile displaying authored verses, bookmarked verses, and social stats.
- `/submit`: Form for authenticated poets to submit new poems for review.
- `/admin`: Moderation console for administrators to manage submissions, poems, and users.
- `/event` and `/event/[id]`: Club gatherings, events, and festival pages.
- `/about`: Platform mission and community background.
- `/login`: Dedicated authentication gateway.
- `/setup-profile`: Mandatory onboarding view for configuring display name and portrait.
- `/pr`: Dedicated puzzle page with streamlined header and footer.

### View Layer Decoupling Pattern

The codebase separates Next.js route entry files from complex UI rendering logic:
- `src/app/[route]/page.js`: Thin entry points handling metadata, server-side data fetching (SSR), and dynamic routing parameters.
- `src/views/[ViewName]Page.jsx`: Client-side view controllers managing internal UI state, form submissions, interactive modal controls, and Supabase client queries.

This separation keeps routing configurations minimal and isolates complex client logic from server components.

### Component Hierarchy

Components are grouped by domain in `src/components/`:
- `common/`: Reusable primitives across pages (ApplauseButton, BookmarkButton, ImageUpload, RichTextEditor, Slideshow, MultiSelectDropdown).
- `poems/`: Domain components for poem rendering (NoteCard, NotesGrid).
- `layout/`: Global structure (Navbar, Footer, HeroSection, SocialShareButtons).
- `modals/`: Overlay dialogues (EditPoemModal, EditProfileModal, FollowListModal, ShareQuoteModal).
- `auth/`: Security wrappers (ProtectedRoute, ProfileGuard).
- `ui/`: Headless and styled primitive UI components based on Radix UI and Tailwind CSS (Dialog, Tabs, Button, Card, Input, Label, Select, Textarea).

### Styling and Design System

The platform implements an editorial Dark Academia aesthetic:
- Palette: Warm monochrome stone backgrounds (`bg-stone-950`, `bg-stone-900`), aged gold accents (`text-amber-500`, `border-amber-600`), and dark crimson accents (`#852221`).
- Typography:
  - Heading font: `font-cinzel` (classic serif capital letters).
  - Body and prose: `font-serif` and standard sans-serif.
  - Parchment cards: `font-handwriting` and custom styling imitating vintage handwritten notes.
- Animations: Framer Motion provides page transitions, modal entrances, and tactile button micro-interactions.

---

## 3. Authentication and Authorization

### Google OAuth Integration

Authentication relies exclusively on Google OAuth via Supabase Auth.
1. The user clicks "Continue with Google" on `/login`.
2. Supabase initiates the OAuth handshake with Google.
3. Upon return, the session token is stored in the browser.
4. An automated PostgreSQL trigger (`handle_new_user`) detects the new entry in `auth.users` and creates a corresponding profile record in `public.profiles`.

### AuthContext Lifecycle

The global `AuthContext.jsx` wraps the application in `src/app/layout.js`:
- Tracks `user`: Raw authenticated user object from Supabase Auth.
- Tracks `userProfile`: Extended profile data from `public.profiles` (display name, bio, photo URL, role, follower arrays).
- Tracks `isAdmin` and `isMainAdmin`: Evaluates administrative rights.
- Realtime synchronization: Subscribes to Supabase postgres_changes on the user profile to propagate role or metadata updates without full page reloads.

### Role-Based Access Control (RBAC)

The system supports three user levels:
1. `user`: Standard community member. Can submit poems, applaud, bookmark, follow other poets, and edit or delete their own published poems.
2. `semi-admin`: Community moderator. Can access the admin dashboard, approve or reject submissions, edit any poem, and delete violating content. Cannot promote other users.
3. `admin` / `main-admin`: System administrator determined by DB role or matching `NEXT_PUBLIC_ADMIN_EMAIL`. Possesses full permissions including user role assignment and system settings.

### Route Protection and Onboarding Guards

- `ProfileGuard.jsx`: Runs globally on all authenticated routes. If an authenticated user lacks a `display_name`, they are automatically redirected to `/setup-profile`.
- `ProtectedRoute.jsx`: Wraps protected pages (`/admin`, `/submit`). Non-authenticated visitors are redirected to `/login`. Non-admin users attempting to access admin-only routes are redirected to `/`.

---

## 4. Content Pipeline and Publishing Workflow

```
[ Poet: /submit ]
       │ (Tiptap Rich Text Editor)
       ▼
public.poem_submissions (status: 'pending')
       │
       ▼
[ Admin Dashboard: /admin ]
       ├── Reject ──> Status marked 'rejected' or deleted
       │
       └── Approve ─> 1. Inserted into public.notes
                      2. Deleted from public.poem_submissions
                      3. Immediately visible on /poems and poet profile
```

### Poem Submission Flow
1. Authenticated poets write their poems using the `RichTextEditor` on `/submit`.
2. Poets provide title, preview snippet, optional review description, and selectable tags.
3. The submission is written to `public.poem_submissions` with status `'pending'`.
4. Row Level Security guarantees that regular users can only insert their own submissions.

### Admin Moderation Engine
1. Administrators review submissions in the "Submissions" tab of `AdminPage.jsx`.
2. The submission content is rendered with DOMPurify sanitization.
3. Upon approval:
   - The record is copied into `public.notes` with all metadata intact.
   - The submission is removed from `public.poem_submissions`.
4. Upon rejection:
   - The record is deleted or updated with status `'rejected'`.

### Publication and Author Management
- Once in `public.notes`, poems are publicly readable by any guest or user.
- The author retains full rights to update or delete their poems from `NotePage.jsx` or their `ProfilePage.jsx`.
- Administrators retain override permissions to edit or delete any poem for moderation purposes.

---

## 5. Rich Text and Formatting Engine

Poetry relies heavily on whitespace, deliberate line breaks, and stanza separation. Standard HTML parsers collapse multiple consecutive empty lines. The platform uses a specialized processing pipeline to maintain formatting fidelity.

### Tiptap Editor Integration
- Uses `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, and `@tiptap/extension-text-align`.
- Generates standard HTML output while preserving paragraph blocks and line break tags.

### Stanza and Break Preservation
The utility `src/lib/poemFormatter.js` processes content prior to database write and upon render:
1. Hard break preservation: Empty paragraphs `<p></p>` are converted into `<p class="poem-break">&nbsp;</p>` or explicit breaks.
2. CSS rule enforcement: The class `.poem-content` in `src/app/globals.css` applies:
   - `white-space: pre-wrap`
   - Preservation of `<br>` and empty paragraph heights
   - Line height tuned for readability (leading-relaxed)

### Sanitization Pipeline
All user-generated HTML content is sanitized using `dompurify` prior to rendering with `dangerouslySetInnerHTML`. This prevents Cross-Site Scripting (XSS) while allowing styling tags (`<p>`, `<em>`, `<strong>`, `<u>`, `<br>`).

---

## 6. Social Features and Interaction Systems

### Atomic Applause System
- Allows users to show appreciation for verses.
- Handled through the stored procedure `toggle_applause(p_note_id, p_is_applauded)`.
- Updates `public.applauses` and increments or decrements `public.notes.applause_count` in a single atomic transaction, preventing race conditions.

### Bookmark Collection System
- Allows users to save favorite verses into personal reading rolls.
- Backed by the join table `public.bookmarks` with unique constraints on `(user_id, note_id)`.
- Accessible via the "Bookmarks" tab on the user profile.
- Compact bookmark buttons on `NoteCard` provide rapid saving directly from feeds.

### Followers Graph
- Manages author following via the stored procedure `handle_follow(p_target_user_id, p_is_following)`.
- Modifies PostgreSQL arrays `followers` and `following` on `public.profiles`.
- Displayed on poet profiles through the interactive `FollowListModal.jsx`.

### Shareable Quote Graphic Engine
- Readers can select any stanza on `/note/[id]` to trigger a quote-share bar.
- `ShareQuoteModal.jsx` renders an off-screen high-resolution 600x600 canvas.
- Renders the selected quote excerpt, poem title, author name, and a dynamic QR code (`qrcode.react`) pointing directly to the poem URL.
- Converts the DOM node into a PNG image using `html-to-image` for download or native Web Share API distribution.

---

## 7. Media and Storage Architecture

Avatars and profile portraits are stored in Supabase Storage under the bucket `pfp`.

### Upload Lifecycle
1. User selects an image in `ImageUpload.jsx`.
2. Client-side compression runs via `browser-image-compression`:
   - Maximum size: 0.2 MB (200 KB)
   - Maximum dimensions: 800x800 px
   - Processing executed in a Web Worker to avoid blocking UI execution.
3. The compressed image is uploaded to `${user.id}/${Date.now()}-${sanitizedName}` in bucket `pfp`.
4. Storage RLS policies enforce that users may only write to folders matching their authenticated UUID.
5. The public URL is returned and saved to `public.profiles.photo_url`.

---

## 8. Database and Scheduling Infrastructure

### PostgreSQL Engine
Hosted on Supabase with automatic connection pooling, realtime replication channels, and Row Level Security enforcement on every table.

### pg_cron Keep-Alive System
To prevent database suspension on Supabase free-tier instances (which pause after 7 consecutive days without queries), an automated job is registered using the PostgreSQL `pg_cron` extension:
- Schedule: `0 12 */3 * *` (executes every 3 days at 12:00 UTC).
- Task: Executes a lightweight update to `public.keep_alive`.
- Details and management queries are documented in `docs/Database.md`.
