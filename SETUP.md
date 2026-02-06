# Atlas — Setup Guide

## Step 1: Push to GitHub

Open your terminal, navigate to where you downloaded the `atlas` folder, and run:

```bash
cd atlas
git init
git branch -m main
git add -A
git commit -m "Atlas v1 — AI office assistant MVP"
git remote add origin https://github.com/blakewinters/atlas.git
git push -u origin main
```

## Step 2: Set up Supabase Database

1. Go to https://supabase.com/dashboard/project/yegijuskwvaebjvuxcxf
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` and paste it in
5. Click **Run** (or Cmd+Enter)
6. You should see "Success. No rows returned" — that means it worked

## Step 3: Create .env.local

In the atlas folder root, create a file called `.env.local`:

```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Note: You'll also need the SUPABASE_SERVICE_ROLE_KEY later. Find it in your Supabase dashboard under Settings > API.

## Step 4: Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the Atlas dashboard.

Try: Click **Chat** in the sidebar and send a message. Atlas should respond.
Try: Click **New Meeting** and paste a Granola transcript. Atlas will process it.

## Step 5: Deploy to Netlify

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub account and select the `atlas` repo
4. Build settings should auto-detect (if not: Build command = `npm run build`, Publish directory = `.next`)
5. Click **Show advanced** → **New variable** and add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `NEXT_PUBLIC_SUPABASE_URL` = https://yegijuskwvaebjvuxcxf.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy site**

## Step 6: Rotate Your API Key

Since you shared your Anthropic API key in chat:
1. Go to https://console.anthropic.com/settings/keys
2. Delete `atlas_claude_key`
3. Create a new key
4. Update it in `.env.local` and Netlify env vars

## What Works in v1

- **Chat**: Talk to Claude with context about your role at BiggerPockets Marketplace
- **Meeting Processor**: Paste Granola transcript → get summary, action items, decisions, key topics
- **Dashboard**: View layout (data persistence coming in v2)

## Coming in v2

- Supabase auth (email magic link)
- Persistent storage for meetings and tasks
- Daily brief automation
- Weekly insights digest
