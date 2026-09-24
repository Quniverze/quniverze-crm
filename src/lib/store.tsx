'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Lead,
  Opportunity,
  OpportunityStage,
  FollowUp,
  Activity,
  Client,
  CallOutcome,
  FollowUpTimingOption
} from '@/types/crm';
import {
  SEED_USERS,
  SEED_LEADS,
  SEED_OPPORTUNITIES,
  SEED_FOLLOW_UPS,
  SEED_ACTIVITIES,
  SEED_CLIENTS
} from './seed-data';
import { supabase, isSupabaseConfigured } from './supabase';

interface CRMContextType {
  // Current user & role
  currentUser: User;
  setRole: (role: UserRole) => void;

  // View navigation
  currentView: 'overview' | 'queue' | 'leads' | 'pipeline' | 'clients';
  setCurrentView: (view: 'overview' | 'queue' | 'leads' | 'pipeline' | 'clients') => void;

  // Selected lead for detail/call
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;

  // Leads
  leads: Lead[];
  addLead: (data: Partial<Lead>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;

  // Opportunities & Pipeline
  opportunities: Opportunity[];
  addOpportunity: (data: Partial<Opportunity>) => Opportunity;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  moveOpportunityStage: (id: string, stage: OpportunityStage) => void;
  convertToClient: (opportunityId: string) => Client | null;

  // Call Flow (Outreach Executive)
  processCallOutcome: (params: {
    leadId: string;
    outcome: CallOutcome;
    followUpTiming: FollowUpTimingOption;
    customDate?: string;
    note?: string;
    assignToFounder?: boolean;
    estimatedValue?: number;
  }) => void;

  // Activities
  activities: Activity[];
  addActivity: (act: {
    lead_id?: string;
    opportunity_id?: string;
    client_id?: string;
    type: Activity['type'];
    body: string;
  }) => void;
  getLeadActivities: (leadId: string) => Activity[];

  // Follow-ups
  followUps: FollowUp[];
  completeFollowUp: (id: string) => void;
  overdueFollowUps: FollowUp[];
  todayFollowUps: FollowUp[];
  upcomingFollowUps: FollowUp[];

  // Clients
  clients: Client[];

  // Modals & Utilities
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  importLeads: (leads: Array<Partial<Lead>>) => { imported: number; duplicates: number };

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Reset demo
  resetToDemoData: () => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

const STORAGE_KEY_PREFIX = 'quniverze_crm_v3_';

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('outreach');
  const [currentView, setCurrentView] = useState<'overview' | 'queue' | 'leads' | 'pipeline' | 'clients'>('queue');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from LocalStorage or Seed Data
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEY_PREFIX + 'role') as UserRole;
      if (savedRole === 'founder' || savedRole === 'outreach') {
        setRoleState(savedRole);
        setCurrentView(savedRole === 'founder' ? 'overview' : 'queue');
      }

      const savedLeads = localStorage.getItem(STORAGE_KEY_PREFIX + 'leads');
      const savedOpps = localStorage.getItem(STORAGE_KEY_PREFIX + 'opps');
      const savedFUs = localStorage.getItem(STORAGE_KEY_PREFIX + 'followups');
      const savedActs = localStorage.getItem(STORAGE_KEY_PREFIX + 'activities');
      const savedClients = localStorage.getItem(STORAGE_KEY_PREFIX + 'clients');

      if (savedLeads && savedOpps) {
        setLeads(JSON.parse(savedLeads));
        setOpportunities(JSON.parse(savedOpps));
        setFollowUps(savedFUs ? JSON.parse(savedFUs) : SEED_FOLLOW_UPS);
        setActivities(savedActs ? JSON.parse(savedActs) : SEED_ACTIVITIES);
        setClients(savedClients ? JSON.parse(savedClients) : SEED_CLIENTS);
      } else {
        // First load: initialize with seed data
        setLeads(SEED_LEADS);
        setOpportunities(SEED_OPPORTUNITIES);
        setFollowUps(SEED_FOLLOW_UPS);
        setActivities(SEED_ACTIVITIES);
        setClients(SEED_CLIENTS);
      }
    } catch (e) {
      console.error('Failed to load CRM state from localStorage', e);
      setLeads(SEED_LEADS);
      setOpportunities(SEED_OPPORTUNITIES);
      setFollowUps(SEED_FOLLOW_UPS);
      setActivities(SEED_ACTIVITIES);
      setClients(SEED_CLIENTS);
    }

    // Live cloud synchronization via Supabase (if configured)
    if (isSupabaseConfigured && supabase) {
      const syncWithSupabase = async () => {
        try {
          const [leadsRes, oppsRes, fuRes, actsRes, clientsRes] = await Promise.all([
            supabase.from('leads').select('*').order('created_at', { ascending: false }),
            supabase.from('opportunities').select('*').order('created_at', { ascending: false }),
            supabase.from('follow_ups').select('*').order('due_at', { ascending: true }),
            supabase.from('activities').select('*').order('created_at', { ascending: false }),
            supabase.from('clients').select('*').order('created_at', { ascending: false })
          ]);

          if (leadsRes.error) {
            // Tables may not be created yet in Supabase
            console.warn('Supabase not ready or table missing:', leadsRes.error.message);
            return;
          }

          if (leadsRes.data && leadsRes.data.length > 0) {
            setLeads(leadsRes.data);
            setOpportunities(oppsRes.data || []);
            setFollowUps(fuRes.data || []);
            setActivities(actsRes.data || []);
            setClients(clientsRes.data || []);
          } else {
            // Fresh database tables: seed default demo records into Supabase in relational order
            await supabase.from('users').upsert(SEED_USERS);
            await supabase.from('leads').upsert(SEED_LEADS);
            await Promise.allSettled([
              supabase.from('opportunities').upsert(SEED_OPPORTUNITIES),
              supabase.from('follow_ups').upsert(SEED_FOLLOW_UPS),
              supabase.from('activities').upsert(SEED_ACTIVITIES),
              supabase.from('clients').upsert(SEED_CLIENTS)
            ]);
            setLeads(SEED_LEADS);
            setOpportunities(SEED_OPPORTUNITIES);
            setFollowUps(SEED_FOLLOW_UPS);
            setActivities(SEED_ACTIVITIES);
            setClients(SEED_CLIENTS);
          }
        } catch (err) {
          console.warn('Supabase sync skipped, continuing with local store:', err);
        }
      };

      syncWithSupabase();

      // Realtime listener across devices
      const channel = supabase
        .channel('crm-realtime-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads((prev) => prev.some(l => l.id === payload.new.id) ? prev : [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
          } else if (payload.eventType === 'DELETE') {
            setLeads((prev) => prev.filter(l => l.id !== payload.old.id));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setOpportunities((prev) => prev.some(o => o.id === payload.new.id) ? prev : [payload.new as Opportunity, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOpportunities((prev) => prev.map(o => o.id === payload.new.id ? payload.new as Opportunity : o));
          } else if (payload.eventType === 'DELETE') {
            setOpportunities((prev) => prev.filter(o => o.id !== payload.old.id));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setActivities((prev) => prev.some(a => a.id === payload.new.id) ? prev : [payload.new as Activity, ...prev]);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setFollowUps((prev) => prev.some(f => f.id === payload.new.id) ? prev : [payload.new as FollowUp, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFollowUps((prev) => prev.map(f => f.id === payload.new.id ? payload.new as FollowUp : f));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients((prev) => prev.some(c => c.id === payload.new.id) ? prev : [payload.new as Client, ...prev]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'leads', JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'opps', JSON.stringify(opportunities));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'followups', JSON.stringify(followUps));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'clients', JSON.stringify(clients));
    }
  }, [leads, opportunities, followUps, activities, clients]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const currentUser: User = useMemo(() => {
    return SEED_USERS.find((u) => u.role === role) || SEED_USERS[1];
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'role', newRole);
    // Set appropriate primary screen
    if (newRole === 'founder') {
      setCurrentView('overview');
      showToast('Switched to Founder Command Center');
    } else {
      setCurrentView('queue');
      showToast('Switched to Outreach Call Queue');
    }
  };

  // Lead CRUD
  const addLead = (data: Partial<Lead>): Lead => {
    const newLead: Lead = {
      id: 'lead_' + Date.now(),
      business_name: data.business_name || 'Untitled Business',
      contact_name: data.contact_name || '',
      phone: data.phone || '',
      whatsapp: data.whatsapp || data.phone || '',
      email: data.email || '',
      website: data.website || '',
      instagram: data.instagram || '',
      industry: data.industry || 'Other',
      location: data.location || 'Kozhikode',
      lead_source: data.lead_source || 'Direct Entry',
      status: data.status || 'To Call',
      assigned_to: data.assigned_to || (role === 'outreach' ? 'usr_outreach' : 'usr_founder'),
      description: data.description || '',
      observation: data.observation || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLeads((prev) => [newLead, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').insert(newLead).then(({ error }) => {
        if (error) console.warn('Supabase lead insert warning:', error.message);
      });
    }

    // Append created activity
    addActivity({
      lead_id: newLead.id,
      type: 'created',
      body: `Lead created by ${currentUser.name}.`
    });

    showToast(`Lead created: ${newLead.business_name}`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const updatedLead = { ...updates, updated_at: new Date().toISOString() };
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedLead } : l))
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update(updatedLead).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase lead update warning:', error.message);
      });
    }
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setOpportunities((prev) => prev.filter((o) => o.lead_id !== id));
    setFollowUps((prev) => prev.filter((f) => f.lead_id !== id));
    setActivities((prev) => prev.filter((a) => a.lead_id !== id));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase lead delete warning:', error.message);
      });
    }

    showToast('Lead deleted');
  };

  const getLead = (id: string) => leads.find((l) => l.id === id);

  // Opportunities & Pipeline
  const addOpportunity = (data: Partial<Opportunity>): Opportunity => {
    const newOpp: Opportunity = {
      id: 'opp_' + Date.now(),
      lead_id: data.lead_id!,
      estimated_value: data.estimated_value || 35000,
      probability: data.probability || 50,
      stage: data.stage || 'Qualified',
      assigned_to: data.assigned_to || 'usr_founder',
      next_action: data.next_action || 'Founder review',
      next_follow_up_at: data.next_follow_up_at,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setOpportunities((prev) => [newOpp, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('opportunities').insert(newOpp).then(({ error }) => {
        if (error) console.warn('Supabase opp insert warning:', error.message);
      });
    }

    addActivity({
      lead_id: newOpp.lead_id,
      opportunity_id: newOpp.id,
      type: 'stage_changed',
      body: `Opportunity created in ${newOpp.stage} (₹${newOpp.estimated_value.toLocaleString()})`
    });

    return newOpp;
  };

  const updateOpportunity = (id: string, updates: Partial<Opportunity>) => {
    const updatedOpp = { ...updates, updated_at: new Date().toISOString() };
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updatedOpp } : o))
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('opportunities').update(updatedOpp).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase opp update warning:', error.message);
      });
    }
  };

  const moveOpportunityStage = (id: string, stage: OpportunityStage) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    updateOpportunity(id, { stage });

    // Also sync lead status
    const leadStatusMap: Record<OpportunityStage, Lead['status']> = {
      Qualified: 'Qualified',
      Meeting: 'Meeting',
      Proposal: 'Proposal',
      Negotiation: 'Negotiation',
      Won: 'Won',
      Lost: 'Lost'
    };
    updateLead(opp.lead_id, { status: leadStatusMap[stage] });

    addActivity({
      lead_id: opp.lead_id,
      opportunity_id: opp.id,
      type: 'stage_changed',
      body: `Stage updated to ${stage} by ${currentUser.name}.`
    });

    if (stage === 'Won') {
      convertToClient(opp.id);
      showToast(`Deal Won! Converted to Client.`);
    } else {
      showToast(`Moved to ${stage}`);
    }
  };

  const convertToClient = (opportunityId: string): Client | null => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp) return null;
    const lead = leads.find((l) => l.id === opp.lead_id);
    if (!lead) return null;

    // Check if client already exists
    const existing = clients.find((c) => c.lead_id === lead.id);
    if (existing) return existing;

    const newClient: Client = {
      id: 'cli_' + Date.now(),
      lead_id: lead.id,
      business_name: lead.business_name,
      contact_name: lead.contact_name,
      phone: lead.phone,
      email: lead.email,
      project: 'Custom Web & Software Development',
      value: opp.estimated_value,
      status: 'active',
      notes: opp.notes || lead.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClients((prev) => [newClient, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').insert(newClient).then(({ error }) => {
        if (error) console.warn('Supabase client insert warning:', error.message);
      });
    }

    addActivity({
      lead_id: lead.id,
      opportunity_id: opp.id,
      client_id: newClient.id,
      type: 'converted',
      body: `Deal closed! Converted into active Client (Project Value: ₹${opp.estimated_value.toLocaleString()}).`
    });

    return newClient;
  };

  // Call Flow Engine (Outreach Executive)
  const processCallOutcome = ({
    leadId,
    outcome,
    followUpTiming,
    customDate,
    note,
    assignToFounder,
    estimatedValue
  }: {
    leadId: string;
    outcome: CallOutcome;
    followUpTiming: FollowUpTimingOption;
    customDate?: string;
    note?: string;
    assignToFounder?: boolean;
    estimatedValue?: number;
  }) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const nowIso = new Date().toISOString();

    // 1. Calculate follow-up due date
    let followUpDate: Date | null = new Date();
    if (followUpTiming === 'Tomorrow') {
      followUpDate.setDate(followUpDate.getDate() + 1);
    } else if (followUpTiming === '3 Days') {
      followUpDate.setDate(followUpDate.getDate() + 3);
    } else if (followUpTiming === '7 Days') {
      followUpDate.setDate(followUpDate.getDate() + 7);
    } else if (followUpTiming === 'Custom' && customDate) {
      followUpDate = new Date(customDate);
    } else {
      followUpDate = null;
    }

    // 2. Map outcome to Lead status
    let nextStatus = lead.status;
    if (outcome === 'Interested') {
      nextStatus = assignToFounder ? 'Qualified' : 'Interested';
    } else if (outcome === 'Meeting Requested') {
      nextStatus = 'Meeting';
    } else if (outcome === 'Not Interested' || outcome === 'Wrong Number') {
      nextStatus = 'Lost';
    } else if (outcome === 'Call Later' || outcome === 'Busy' || outcome === 'No Answer' || outcome === 'WhatsApp Sent') {
      nextStatus = 'Contacted';
    }

    // 3. Update Lead record
    const updatedLeadFields: Partial<Lead> = {
      status: nextStatus,
      last_contact_at: nowIso,
      next_follow_up_at: followUpDate ? followUpDate.toISOString() : undefined
    };

    if (assignToFounder) {
      updatedLeadFields.assigned_to = 'usr_founder';
    }
    if (note) {
      updatedLeadFields.notes = lead.notes ? `${lead.notes}\n${note}` : note;
    }

    updateLead(leadId, updatedLeadFields);

    // 4. Log Call Activity
    const actBody = `Call outcome: ${outcome}.${note ? ` Note: "${note}"` : ''}${
      assignToFounder ? ' Handed off to Founder.' : ''
    }`;
    addActivity({
      lead_id: leadId,
      type: outcome === 'Interested' || outcome === 'Meeting Requested' ? 'outcome' : 'called',
      body: actBody
    });

    // 5. If assigned to founder or interested, ensure opportunity exists
    if (outcome === 'Interested' || outcome === 'Meeting Requested' || assignToFounder) {
      const existingOpp = opportunities.find((o) => o.lead_id === leadId);
      if (!existingOpp) {
        addOpportunity({
          lead_id: leadId,
          stage: outcome === 'Meeting Requested' ? 'Meeting' : 'Qualified',
          estimated_value: estimatedValue || 35000,
          assigned_to: 'usr_founder',
          next_action: outcome === 'Meeting Requested' ? 'Conduct client meeting' : 'Founder follow-up call'
        });
      }
    }

    // 6. Schedule Follow-up if applicable
    if (followUpDate) {
      const newFollowUp: FollowUp = {
        id: 'fu_' + Date.now(),
        lead_id: leadId,
        assigned_to: assignToFounder ? 'usr_founder' : 'usr_outreach',
        due_at: followUpDate.toISOString(),
        action:
          outcome === 'Interested'
            ? 'Follow up with interested prospect'
            : outcome === 'Meeting Requested'
            ? 'Discovery meeting with prospect'
            : `Follow-up call (${outcome})`,
        status: 'pending',
        notes: note,
        created_at: nowIso
      };
      setFollowUps((prev) => [newFollowUp, ...prev]);

      if (isSupabaseConfigured) {
        supabase.from('follow_ups').insert([newFollowUp]).then(({ error }) => {
          if (error) console.warn('[Supabase] follow_ups insert:', error.message);
        });
      }
    }

    showToast(`Call recorded for ${lead.business_name}`);
  };

  // Activities
  const addActivity = (act: {
    lead_id?: string;
    opportunity_id?: string;
    client_id?: string;
    type: Activity['type'];
    body: string;
  }) => {
    const newAct: Activity = {
      id: 'act_' + Date.now(),
      person_id: currentUser.id,
      ...act,
      created_at: new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);

    if (isSupabaseConfigured) {
      supabase.from('activities').insert([newAct]).then(({ error }) => {
        if (error) console.warn('[Supabase] activities insert:', error.message);
      });
    }
  };

  const getLeadActivities = (leadId: string) => {
    return activities.filter((a) => a.lead_id === leadId);
  };

  // Follow-ups
  const completeFollowUp = (id: string) => {
    const completedAt = new Date().toISOString();
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'completed', completed_at: completedAt } : f
      )
    );
    if (isSupabaseConfigured) {
      supabase
        .from('follow_ups')
        .update({ status: 'completed', completed_at: completedAt })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[Supabase] follow_ups update:', error.message);
        });
    }
    showToast('Follow-up marked complete');
  };

  const nowMs = Date.now();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndMs = todayEnd.getTime();

  const overdueFollowUps = useMemo(() => {
    return followUps.filter((f) => f.status === 'pending' && new Date(f.due_at).getTime() < nowMs);
  }, [followUps, nowMs]);

  const todayFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (f.status !== 'pending') return false;
      const t = new Date(f.due_at).getTime();
      return t >= nowMs && t <= todayEndMs;
    });
  }, [followUps, nowMs, todayEndMs]);

  const upcomingFollowUps = useMemo(() => {
    return followUps.filter((f) => f.status === 'pending' && new Date(f.due_at).getTime() > todayEndMs);
  }, [followUps, todayEndMs]);

  // CSV Lead Import with duplicate detection
  const importLeads = (newLeadsData: Array<Partial<Lead>>) => {
    let imported = 0;
    let duplicates = 0;

    const existingPhones = new Set(leads.map((l) => l.phone.replace(/\D/g, '')));
    const existingNames = new Set(leads.map((l) => l.business_name.toLowerCase().trim()));

    const leadsToAdd: Lead[] = [];

    newLeadsData.forEach((row) => {
      const cleanPhone = (row.phone || '').replace(/\D/g, '');
      const cleanName = (row.business_name || '').toLowerCase().trim();

      if ((cleanPhone && existingPhones.has(cleanPhone)) || existingNames.has(cleanName)) {
        duplicates++;
        return;
      }

      if (cleanPhone) existingPhones.add(cleanPhone);
      if (cleanName) existingNames.add(cleanName);

      const lead: Lead = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        business_name: row.business_name || 'Imported Business',
        contact_name: row.contact_name || '',
        phone: row.phone || '',
        whatsapp: row.whatsapp || row.phone || '',
        email: row.email || '',
        website: row.website || '',
        instagram: row.instagram || '',
        industry: row.industry || 'Other',
        location: row.location || 'Kozhikode',
        lead_source: 'CSV Import',
        status: 'To Call',
        assigned_to: 'usr_outreach',
        description: row.description || '',
        observation: row.observation || '',
        notes: row.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      leadsToAdd.push(lead);
      imported++;
    });

    if (leadsToAdd.length > 0) {
      setLeads((prev) => [...leadsToAdd, ...prev]);
      if (isSupabaseConfigured) {
        supabase.from('leads').insert(leadsToAdd).then(({ error }) => {
          if (error) console.warn('[Supabase] bulk import error:', error.message);
        });
      }
    }

    showToast(`Imported ${imported} leads (${duplicates} duplicates skipped)`);
    return { imported, duplicates };
  };

  const resetToDemoData = () => {
    setLeads(SEED_LEADS);
    setOpportunities(SEED_OPPORTUNITIES);
    setFollowUps(SEED_FOLLOW_UPS);
    setActivities(SEED_ACTIVITIES);
    setClients(SEED_CLIENTS);
    localStorage.clear();
    showToast('Reset to default Quniverze CRM demo dataset');
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setRole,
        currentView,
        setCurrentView,
        selectedLeadId,
        setSelectedLeadId,
        leads,
        addLead,
        updateLead,
        deleteLead,
        getLead,
        opportunities,
        addOpportunity,
        updateOpportunity,
        moveOpportunityStage,
        convertToClient,
        processCallOutcome,
        activities,
        addActivity,
        getLeadActivities,
        followUps,
        completeFollowUp,
        overdueFollowUps,
        todayFollowUps,
        upcomingFollowUps,
        clients,
        searchModalOpen,
        setSearchModalOpen,
        quickAddOpen,
        setQuickAddOpen,
        importModalOpen,
        setImportModalOpen,
        importLeads,
        toastMessage,
        showToast,
        resetToDemoData
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
