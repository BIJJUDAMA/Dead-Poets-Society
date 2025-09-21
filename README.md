# Dead Poets Society - Poetry Platform

This is a modern web application built for a community of poets to share, discover, and appreciate poetry. It's built with a powerful and scalable stack, focusing on a great developer experience and a seamless user interface.

## ✨ Features

- **User Authentication**: Secure sign-up and login using Google OAuth, powered by Supabase Auth.
- **Profile Management**: Users can create and edit their poet profiles, including a display name, bio, and profile picture.
- **Poem Submissions**: An easy-to-use form for poets to submit their work for review.
- **Admin Dashboard**: A protected area for administrators to review, approve, or reject new poem submissions and manage users.
- **Interactive Poems**: Readers can "applaud" poems they enjoy.
- **Social Features**: Users can follow their favorite poets.
- **Dynamic Content**: Infinite scrolling on the poems page for a seamless browsing experience.

## 🚀 Tech Stack

- **Frontend**: React with Vite for a fast development experience.
- **Backend & Database**: Supabase (PostgreSQL) for authentication, database, and storage.
- **Styling**: Tailwind CSS with shadcn/ui for a beautiful and consistent component library.
- **Animations**: Framer Motion for smooth page transitions and interactive elements.
- **Deployment**: Vercel

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/BIJJUDAMA/Dead-Poets-Society
cd Dead-Poets-Society

```

### 2. Install Dependencies

```bash
npm install
```


### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project and add your Supabase credentials. You can find these in your Supabase project's **Settings > API** section.

```env
# .env.local

VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_ADMIN_EMAIL="your-admin-email@example.com"
```

### 🛠️ Future Plans
- [ ] Move the project from ReactJS to NextJS
- [ ] Integrate with **B2 Backblaze** for media storage.  
- [ ] Build an **Events Page** for showcasing club activities.  
- [ ] Revamp **About Us Page** with dynamic team/year-wise structure.

