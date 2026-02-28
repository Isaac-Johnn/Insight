📘 README.md — Insight
Insight

Insight is a full-stack, personalized social media platform built with Next.js and Supabase.

It is not a CRUD clone.

It is a deterministic, SQL-driven recommendation system wrapped in a modern social app UI.

🚀 What Is Insight?

Insight is an Instagram-style social platform that:

Personalizes feeds using interaction modeling

Ranks content using logarithmic scaling and time decay

Suggests users based on graph relationships

Updates comments and engagement in real-time

Enforces strict row-level security (RLS)

Uses server-side computed relationship state (no N+1 queries)

It simulates how modern social platforms architect ranking and personalization systems.

🧠 Novelty

Most social clones:

Sort posts by created_at

Count likes

Reload entire page on updates

Compute relationships on frontend

Insight does something fundamentally different.

1️⃣ Deterministic Personalization Engine

The feed is ranked using:

ln(1 + engagement_score)
× interaction_multiplier
× exponential_time_decay

This introduces:

Diminishing returns (viral control)

Personal affinity weighting

Recency bias

Deterministic scoring logic

No ML required — fully explainable ranking.

2️⃣ Interaction Graph Modeling

A dedicated interactions table models:

user → affinity → creator

Likes and comments increase affinity.

Feed ranking uses this graph to boost creators a user engages with.

This simulates recommendation systems used by real social platforms.

3️⃣ SQL-Centric Architecture

All heavy logic runs in PostgreSQL:

Feed ranking

Explore ranking

is_following computation

Suggested users scoring

Engagement score recalculation

The frontend does not perform joins or relationship computation.

This avoids:

N+1 queries

Inconsistent state

Client-side trust issues

4️⃣ Graph-Based Suggested Users

Suggested users are ranked by:

(mutual_follow_count * 3)
+ (interaction_score * 2)
+ ln(1 + follower_count)

This combines:

Network proximity

Personal engagement

Popularity smoothing

It is not random.
It is structurally ranked.

5️⃣ Real-Time Event-Driven UI

Using Supabase Realtime:

Comments appear instantly across sessions

Engagement score updates live

No polling

No page refresh

Modern WebSocket-driven architecture.

🏗 Architecture Overview
Frontend

Next.js (App Router)

Client components

Optimistic UI updates

State-driven reactivity

Backend

Supabase (Postgres + Auth + RLS + RPC)

SQL ranking functions

Row Level Security

Realtime replication

Storage

Supabase Storage (public image bucket)

Deployment

Designed for Vercel

📁 Project Structure
INSIGHT/
│
├── app/
│   ├── create/
│   ├── explore/
│   ├── feed/
│   ├── login/
│   ├── profile/[userId]/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Comments.tsx
│   ├── PostCard.tsx
│   └── SuggestedUsers.tsx
│
├── lib/
│   ├── supabase/
│   │   └── client.ts
│   └── services/
│       ├── authService.ts
│       ├── commentService.ts
│       ├── followService.ts
│       ├── likeService.ts
│       ├── postService.ts
│       └── suggestedService.ts
│
├── globals.css
└── .env.local
🧱 Database Schema

Core tables:

profiles

posts

comments

likes

followers

interactions

Every table has RLS enabled.

Engagement and relationship logic is computed server-side.

🔐 Security Model

RLS enabled on all tables

Insert policies tied to auth.uid()

Server-side computed relationship state

No frontend trust of relational logic

Public read where appropriate

RPC access controlled via grants

❤️ Engagement Model
engagement_score =
    like_count * 1
    + comment_count * 2

Recalculated on each interaction.

Used in ranking formula.

🧠 Ranking Systems
Personalized Feed

Only self + followed users

Logarithmic engagement scaling

Interaction multiplier

Exponential time decay

Explore Feed

Global ranking

Log scaling

Time decay

is_following computed server-side

⚡ Real-Time Features

Live comments (INSERT subscription)

Live engagement score (UPDATE subscription)

Optimistic UI for likes/comments/follows

Event-driven architecture

🎨 UX Features

Instagram-style like button (gray → pink with pop)

Optimistic comment rendering

Follow/unfollow instant UI change

Suggested users removal on follow

Reusable PostCard component

💡 Why Users Would Prefer Insight
1️⃣ Transparent Personalization

Unlike black-box algorithms:

Insight’s ranking is deterministic and explainable.

Engagement directly influences visibility.

User interactions meaningfully shape their feed.

2️⃣ Less Viral Dominance

Log scaling prevents runaway posts.

High engagement helps, but doesn’t monopolize feed.

3️⃣ Relationship-Driven Discovery

Suggested users are:

Based on mutual network

Influenced by engagement

Balanced by popularity

This creates stronger social clustering.

4️⃣ Real-Time Interactions

No refresh required.

Interactions feel immediate.

Modern experience.

🧠 Key Technical Decisions

SQL over frontend joins

Deterministic ranking over naive sorting

Interaction modeling instead of raw follower weight

Logarithmic engagement scaling

Exponential decay for recency

Event-driven UI instead of refresh-based UX

RLS-first security model

Optimistic UI with rollback protection

📈 Current Maturity Level

Insight includes:

Auth system

Social graph

Ranking engine

Personalization model

Suggested users system

Real-time updates

Secure multi-tenant DB

This is not a beginner CRUD project.

It demonstrates:

Systems thinking

Data modeling

Ranking logic

Backend abstraction

Security awareness

Event-driven frontend architecture

🚀 Future Roadmap

Cursor-based pagination

Notification system

Creator analytics dashboard

Trending detection

Avatar uploads

Edit profile

Feed caching

Precomputed feed model

Graph expansion modeling

🛠 Local Development

Clone repository

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key

Install dependencies:

npm install

Start dev server:

npm run dev

Enable replication for:

posts

comments

📊 Why This Project Matters

Insight demonstrates:

Social graph modeling

Deterministic recommendation logic

Secure multi-tenant architecture

Real-time event systems

SQL-based personalization

Clean frontend layering

It reflects how modern growth-stage startups design social systems.

🧠 Final Thought

Insight is not just a social app.

It is a deterministic recommendation engine implemented with production-style architecture.