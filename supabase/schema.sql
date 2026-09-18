-- ============================================================================
-- QUNIVERZE CRM: DATABASE SCHEMA & ROW-LEVEL SECURITY POLICIES
-- Target Engine: PostgreSQL / Supabase
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PEOPLE TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('founder', 'outreach')),
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY DEFAULT ('lead_' || gen_random_uuid()),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  industry TEXT NOT NULL DEFAULT 'Other',
  location TEXT NOT NULL DEFAULT 'Kozhikode',
  lead_source TEXT DEFAULT 'Manual Research',
  status TEXT NOT NULL DEFAULT 'To Call' CHECK (
    status IN ('New', 'To Call', 'Contacted', 'Interested', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost')
  ),
  assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  observation TEXT,
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY DEFAULT ('opp_' || gen_random_uuid()),
  lead_id TEXT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 50,
  stage TEXT NOT NULL DEFAULT 'Qualified' CHECK (
    stage IN ('Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost')
  ),
  assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  next_action TEXT,
  next_follow_up_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id TEXT PRIMARY KEY DEFAULT ('fu_' || gen_random_uuid()),
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES public.opportunities(id) ON DELETE CASCADE,
  assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 5. ACTIVITIES TABLE (Append-Only Audit Log)
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY DEFAULT ('act_' || gen_random_uuid()),
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES public.opportunities(id) ON DELETE CASCADE,
  client_id TEXT,
  person_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (
    type IN ('created', 'researched', 'called', 'outcome', 'whatsapp', 'meeting', 'proposal', 'stage_changed', 'converted', 'note')
  ),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY DEFAULT ('cli_' || gen_random_uuid()),
  lead_id TEXT REFERENCES public.leads(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  project TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR HIGH-PERFORMANCE OPERATIONAL QUERIES
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned ON public.opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON public.follow_ups(due_at, status);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON public.activities(lead_id, created_at DESC);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and internal role access
CREATE POLICY "Allow internal read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow internal read access" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow internal read access" ON public.opportunities FOR ALL USING (true);
CREATE POLICY "Allow internal read access" ON public.follow_ups FOR ALL USING (true);
CREATE POLICY "Allow internal read access" ON public.activities FOR ALL USING (true);
CREATE POLICY "Allow internal read access" ON public.clients FOR ALL USING (true);

-- SEED PEOPLE
INSERT INTO public.users (id, name, role, email, phone)
VALUES 
  ('usr_founder', 'Faslu (Founder)', 'founder', 'founder@quniverze.com', '+91 98950 12345'),
  ('usr_outreach', 'Adil (Outreach Executive)', 'outreach', 'outreach@quniverze.com', '+91 98950 67890')
ON CONFLICT (id) DO NOTHING;
