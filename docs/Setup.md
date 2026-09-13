# Setup and Deployment Guide

This guide details the instructions required to configure, run, and deploy the Dead Poets Society platform locally and in production.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables Configuration](#2-environment-variables-configuration)
3. [Supabase Project Setup](#3-supabase-project-setup)
   - [Database Schema Migration](#database-schema-migration)
   - [Google OAuth Provider Configuration](#google-oauth-provider-configuration)
   - [Storage Bucket Verification](#storage-bucket-verification)
4. [Local Development](#4-local-development)
5. [Building for Production](#5-building-for-production)
6. [Deployment on Vercel](#6-deployment-on-vercel)

---

## 1. Prerequisites

Before running the application, ensure the following tools are installed:

- Node.js: Version 18.18.0 or later (Node 20 LTS recommended)
- Package Manager: npm (v9+), pnpm, or bun
- Git: For version control
- A Supabase account: To provision the PostgreSQL database, authentication, and object storage

---

## 2. Environment Variables Configuration

Create a `.env.local` file in the root directory of the project:

```bash
# Supabase Project Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Administrative Configuration
NEXT_PUBLIC_ADMIN_EMAIL=your-primary-admin-email@example.com
```

### Variable Reference

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | The HTTPS API URL of your Supabase instance. Found in Project Settings > API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | The public anonymous client key for browser requests. Found in Project Settings > API. |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Email address granted automatic master administrator privileges upon login. |

---

## 3. Supabase Project Setup

### Database Schema Migration

1. Log in to your Supabase Dashboard and select your project.
2. Navigate to the SQL Editor in the left sidebar.
3. Open the file `docs/Database.md` in this repository and locate the section titled **Consolidated Setup Script**.
4. Copy the entire SQL script and paste it into the Supabase SQL Editor.
5. Click **Run** to execute the script.
6. Verify that the following tables appear in Table Editor:
   - `profiles`
   - `notes`
   - `poem_submissions`
   - `applauses`
   - `bookmarks`
   - `keep_alive`

### Google OAuth Provider Configuration

1. In the Supabase Dashboard, navigate to **Authentication** > **Providers** > **Google**.
2. Toggle Google to **Enabled**.
3. In the Google Cloud Console:
   - Create a project (or select an existing one).
   - Go to **APIs & Services** > **Credentials**.
   - Create an **OAuth 2.0 Client ID** of type **Web application**.
   - Add your Supabase Callback URL under **Authorized redirect URIs**:
     `https://<your-project-id>.supabase.co/auth/v1/callback`
   - Add your local and production domains under **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-production-domain.vercel.app`
4. Copy the **Client ID** and **Client Secret** from Google Cloud into the Supabase Google Provider settings and click **Save**.

### Storage Bucket Verification

The SQL migration script automatically creates the `pfp` storage bucket and security policies. To verify:
1. Navigate to **Storage** in the Supabase Dashboard.
2. Confirm the bucket `pfp` exists and is set to **Public**.
3. Under **Policies**, verify that the three storage policies (`Public read access`, `Allow authenticated users to upload to their own folder`, and `Allow authenticated users to update their own pfp`) are present on `storage.objects`.

---

## 4. Local Development

Install dependencies:
```bash
npm install
```

Start the Next.js local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 5. Building for Production

To test the production build locally and verify zero compilation or lint errors:

```bash
npm run build
```

To run the built production server locally:
```bash
npm run start
```

---

## 6. Deployment on Vercel

Dead Poets Society is optimized for deployment on Vercel:

1. Push your repository to GitHub.
2. Log in to Vercel and click **Add New** > **Project**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Next.js**.
5. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
6. Click **Deploy**.
7. Once deployed, add your Vercel production domain to the Supabase **Authentication** > **URL Configuration** > **Redirect URLs** list.
