✅ FINAL ARCHITECTURE LOCKED VERSION
InSight

AI-powered social platform inspired by Instagram — enhanced with:

Smart feed ranking algorithm

Creator analytics dashboard

AI-powered caption & hashtag generator

Built with Next.js + Supabase + Vercel.



🧠 Architecture Philosophy

This project follows:

Server-first architecture (Next.js App Router)

Database-driven ranking logic

Secure AI integration via Supabase Edge Functions

Row Level Security enforced at database level

Aggregation-first analytics (no heavy frontend calculations)



🏗️ Tech Stack (Finalized)
Frontend:
Next.js 14+ (App Router)
TypeScript
TailwindCSS
Server Components + Client Components
TanStack Query (optional for caching)

Backend (Fully Managed):
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Row Level Security
Edge Functions (for AI logic)

AI:
OpenAI API (called from Supabase Edge Function)
NEVER exposed to frontend

Deployment:
Vercel (Frontend)
Supabase (Backend + DB + Storage + Edge Functions)




🗂️ Final Folder Structure (Production Ready)
/app
  /(auth)
    login/page.tsx
    register/page.tsx

  /(main)
    layout.tsx
    feed/page.tsx
    create/page.tsx
    profile/[username]/page.tsx
    analytics/page.tsx

/components
  post/
    PostCard.tsx
    LikeButton.tsx
    CommentSection.tsx
  analytics/
    AnalyticsCharts.tsx
  ai/
    CaptionGenerator.tsx

/lib
  supabase/
    client.ts
    server.ts
  ranking/
    feedQuery.sql
  services/
    analyticsService.ts

/types
  database.ts
  post.ts
  user.ts

/utils
  formatters.ts
  time.ts



🗄️ Database Schema (Optimized)
profiles:

(Extends Supabase auth.users)
id (uuid, pk)
username (unique)
avatar_url
bio
role (user | creator)
created_at


posts:
id (uuid)
user_id (fk → profiles.id)
image_url
caption
engagement_score (cached)
created_at

likes:
id
post_id
user_id
created_at
UNIQUE(post_id, user_id)

comments:
id
post_id
user_id
content
created_at

followers:
follower_id
following_id
created_at
UNIQUE(follower_id, following_id)

interactions:
Stores weighted interaction scores between users.
user_id
target_user_id
interaction_score
updated_at
PRIMARY KEY (user_id, target_user_id)



🧠 Smart Feed Ranking (Moved to Database Layer)

🚨 IMPORTANT CHANGE:

Ranking must NOT be done in frontend.

Instead:

Use SQL function or view

Compute ranking inside Postgres

Return sorted results directly

Example scoring logic:

score =
  (engagement_score * 0.4)
  + (interaction_score * 0.3)
  + (relationship_weight * 0.2)
  - (time_decay * 0.1)

Implementation:

Create SQL function: get_ranked_feed(user_id uuid)

Call via Supabase RPC

This ensures:

Scalability

Clean frontend

Better performance

📊 Analytics System (Production Optimization)

🚨 IMPORTANT CHANGE:

Do NOT compute analytics on every request.

Instead:

Use Materialized Views

Refresh periodically

Store aggregated stats

Example:

creator_post_stats_mv

Contains:

total_likes

total_comments

engagement_rate

post_performance_score

This avoids heavy joins repeatedly.

🤖 AI Caption Generator (SECURE FLOW)

🚨 Critical Security Fix:

Never call OpenAI directly from frontend.

Correct Flow:

Frontend calls Supabase Edge Function

Edge Function calls OpenAI

Returns generated captions

Benefits:

API key never exposed

Rate limiting possible

Safer production deployment

🔒 Security Architecture

Row Level Security enabled on all tables

Users can only:

Edit their posts

Delete their comments

View only allowed analytics

Storage bucket uses RLS policies

Service role key NEVER exposed in frontend

🌍 Environment Variables (Final)

Frontend (.env.local):

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Supabase Edge Functions:

OPENAI_API_KEY=

Never use:
SUPABASE_SERVICE_ROLE_KEY in frontend.

⚙️ Development Workflow (Locked)

Design DB schema in Supabase

Write RLS policies

Create SQL functions (ranking)

Create materialized views (analytics)

Setup Edge Functions (AI)

Build auth flow

Build post creation

Implement feed using RPC ranking

Build analytics dashboard

Deploy

Do NOT start frontend before DB schema is finalized.

📈 Performance Strategy

Index foreign keys

Index created_at

Composite index on (post_id, user_id)

Cache engagement_score column

Use pagination (limit + cursor)

🚀 Deployment Strategy

Frontend:

Vercel

Environment variables configured

Backend:

Supabase hosted

Edge functions deployed

Storage buckets configured

🧪 Future Scaling Options

Redis caching layer

Background job for engagement recalculation

Edge caching on feed endpoint

Queue system for heavy analytics

🎯 What This Project Proves

This project demonstrates:

Full-stack system design

Database optimization

Algorithmic feed ranking

Secure AI integration

Scalable architecture

Production-level thinking