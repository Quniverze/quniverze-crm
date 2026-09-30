'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Lead,
  LeadStage,
  LeadType,
  Activity,
  ActivityType,
  Client,
  DeliveryStatus,
  CallOutcome,
  CRMView,
  UserAccount,
  UserRole,
  PIPELINE_STAGES
} from '@/types/crm';
import { supabase, isSupabaseConfigured } from './supabase';

interface CRMContextType {
  // Auth state
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Navigation & Modals
  currentView: CRMView;
  setCurrentView: (view: CRMView) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  teamModalOpen: boolean;
  setTeamModalOpen: (open: boolean) => void;

  // Sync state
  isSyncing: boolean;
  refreshFromCloud: () => Promise<void>;

  // Leads
  leads: Lead[];
  addLead: (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  advanceStage: (id: string) => void;
  setStage: (id: string, stage: LeadStage) => void;

  // Activities (inline per lead)
  activities: Activity[];
  getLeadActivities: (leadId: string) => Activity[];
  addActivity: (leadId: string, type: ActivityType, text: string) => void;
  logCall: (
    leadId: string,
    outcome: CallOutcome,
    notes: string,
    nextAction: string,
    nextActionDue: string
  ) => void;

  // Clients (Won deals)
  clients: Client[];
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Team Members
  teamMembers: string[];
  addTeamMember: (name: string, username: string, password: string, role: UserRole) => Promise<void>;
  updateUserAccount: (
    id: string,
    updates: { name?: string; username?: string; password?: string; role?: UserRole }
  ) => Promise<void>;
  removeTeamMember: (idOrName: string) => Promise<void>;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

const STORAGE_KEYS = {
  AUTH_USER: 'quniverze_auth_user',
  LEADS: 'quniverze_crm_leads',
  ACTIVITIES: 'quniverze_crm_activities',
  CLIENTS: 'quniverze_crm_clients',
  USERS_LIST: 'quniverze_crm_users_list',
  VIEW: 'quniverze_crm_view'
};

const DEFAULT_ADMIN: UserAccount = {
  id: 'Abid',
  name: 'Abid',
  username: 'abid',
  password: 'password123',
  role: 'admin'
};

// Data mappers between local minimal model and Supabase PostgreSQL schema
function mapRowToLead(row: any): Lead {
  let extra: any = {};
  if (row.notes) {
    try {
      extra = JSON.parse(row.notes);
    } catch {
      extra = { notes: row.notes };
    }
  }

  let nextActionDue = '';
  if (extra.next_action_due) {
    nextActionDue = extra.next_action_due;
  } else if (row.next_follow_up_at) {
    nextActionDue = row.next_follow_up_at.split('T')[0];
  }

  return {
    id: row.id,
    business_name: row.business_name || '',
    contact_name: row.contact_name || '',
    phone: row.phone || '',
    city: row.location || '',
    type: (extra.type || (row.industry === 'Product' ? 'Product' : 'Client Work')) as LeadType,
    stage: (row.status || 'New') as LeadStage,
    assigned_to: row.assigned_to || 'Abid',
    angle: extra.angle || row.observation || '',
    next_action: extra.next_action || row.description || '',
    next_action_due: nextActionDue,
    value: extra.value ? Number(extra.value) : undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };
}

function mapLeadToRow(lead: Lead) {
  return {
    id: lead.id,
    business_name: lead.business_name,
    contact_name: lead.contact_name,
    phone: lead.phone,
    location: lead.city,
    industry: lead.type,
    status: lead.stage,
    assigned_to: lead.assigned_to,
    observation: lead.angle,
    description: lead.next_action,
    next_follow_up_at: lead.next_action_due ? new Date(lead.next_action_due).toISOString() : null,
    notes: JSON.stringify({
      type: lead.type,
      angle: lead.angle,
      next_action: lead.next_action,
      next_action_due: lead.next_action_due,
      value: lead.value
    }),
    updated_at: new Date().toISOString()
  };
}

function mapRowToActivity(row: any): Activity {
  return {
    id: row.id,
    lead_id: row.lead_id || '',
    type: (row.type === 'call' || row.type === 'stage_change' ? row.type : 'note') as ActivityType,
    text: row.body || '',
    created_at: row.created_at || new Date().toISOString()
  };
}

function mapRowToClient(row: any): Client {
  let extra: any = {};
  if (row.notes) {
    try {
      extra = JSON.parse(row.notes);
    } catch {
      extra = { notes: row.notes };
    }
  }

  return {
    id: row.id,
    lead_id: row.lead_id || '',
    business_name: row.business_name || '',
    type: (extra.type || 'Product') as LeadType,
    contract_value: Number(row.value) || 0,
    notes: extra.notes || row.project || '',
    delivery_status: (extra.delivery_status || row.status || 'Not Started') as DeliveryStatus,
    created_at: row.created_at || new Date().toISOString()
  };
}

function mapClientToRow(client: Client) {
  return {
    id: client.id,
    lead_id: client.lead_id,
    business_name: client.business_name,
    project: client.type,
    value: client.contract_value,
    status: client.delivery_status === 'Active' ? 'active' : 'completed',
    notes: JSON.stringify({
      type: client.type,
      notes: client.notes,
      delivery_status: client.delivery_status
    }),
    updated_at: new Date().toISOString()
  };
}

function parseUserRow(row: any): UserAccount {
  let meta: any = {};
  if (row.avatar_url) {
    try {
      meta = JSON.parse(row.avatar_url);
    } catch {}
  }
  return {
    id: row.id || row.name,
    name: row.name || row.id,
    username: meta.username || row.name.toLowerCase().replace(/\s+/g, ''),
    password: meta.password || 'password123',
    role: meta.role || (row.role === 'founder' ? 'admin' : 'member'),
    created_at: row.created_at
  };
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>([DEFAULT_ADMIN]);

  // Navigation & Modals
  const [currentView, setCurrentView] = useState<CRMView>('today');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Safe cloud execution helper
  const executeCloud = async (fn: () => Promise<any>) => {
    if (!isSupabaseConfigured) return;
    try {
      await fn();
    } catch (err) {
      console.error('Cloud sync error:', err);
    }
  };

  // 1. Initial Load: Fetch from Supabase (with localStorage fallback cache)
  const refreshFromCloud = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setIsSyncing(true);

      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
        const parsedUsers = usersData.map(parseUserRow);
        // Ensure Abid is in users
        if (!parsedUsers.some((u) => u.name.toLowerCase() === 'abid')) {
          parsedUsers.unshift(DEFAULT_ADMIN);
        }
        setUsersList(parsedUsers);
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(parsedUsers));
      } else {
        // Seed default admin in cloud
        await supabase.from('users').upsert({
          id: DEFAULT_ADMIN.id,
          name: DEFAULT_ADMIN.name,
          role: 'founder',
          avatar_url: JSON.stringify({
            username: DEFAULT_ADMIN.username,
            password: DEFAULT_ADMIN.password,
            role: DEFAULT_ADMIN.role
          })
        });
        setUsersList([DEFAULT_ADMIN]);
      }

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (leadsData) {
        const mappedLeads = leadsData.map(mapRowToLead);
        setLeads(mappedLeads);
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(mappedLeads));
      }

      // Fetch activities
      const { data: actData } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (actData) {
        const mappedActs = actData.map(mapRowToActivity);
        setActivities(mappedActs);
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mappedActs));
      }

      // Fetch clients
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (clientData) {
        const mappedClients = clientData.map(mapRowToClient);
        setClients(mappedClients);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(mappedClients));
      }
    } catch (err) {
      console.error('Supabase fetch failed, falling back to local cache', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (storedUsersList) {
        const parsed = JSON.parse(storedUsersList);
        if (Array.isArray(parsed) && parsed.length > 0) setUsersList(parsed);
      }

      const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (storedLeads) setLeads(JSON.parse(storedLeads));

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (storedClients) setClients(JSON.parse(storedClients));

      const storedView = localStorage.getItem(STORAGE_KEYS.VIEW) as CRMView | null;
      if (storedView) setCurrentView(storedView);
    } catch (e) {
      console.error(e);
    }

    refreshFromCloud();

    const handleFocus = () => {
      refreshFromCloud();
    };
    window.addEventListener('focus', handleFocus);

    let channel: any;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('quniverze_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
          refreshFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
          refreshFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
          refreshFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
          refreshFromCloud();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (channel) supabase.removeChannel(channel);
    };
  }, [refreshFromCloud]);

  // Auth actions
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check in local/cloud users list
    let matched = usersList.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    // If not found in current memory, try fresh cloud fetch
    if (!matched && isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('users').select('*');
        if (data) {
          const freshList = data.map(parseUserRow);
          matched = freshList.find(
            (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
          );
          if (matched) setUsersList(freshList);
        }
      } catch {}
    }

    // Default admin fallback for initial setup
    if (!matched && cleanUser === 'abid' && (cleanPass === 'password123' || cleanPass === 'abid123')) {
      matched = DEFAULT_ADMIN;
    }

    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(matched));
      showToast(`Welcome, ${matched.name}`);
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    showToast('Logged out');
  };

  // Team Management
  const teamMembers = usersList.map((u) => u.name);

  const addTeamMember = async (name: string, username: string, password: string, role: UserRole) => {
    const trimmedName = name.trim();
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedName || !trimmedUser || !trimmedPass) return;

    const newAccount: UserAccount = {
      id: trimmedName,
      name: trimmedName,
      username: trimmedUser,
      password: trimmedPass,
      role
    };

    setUsersList((prev) => {
      const filtered = prev.filter((u) => u.id !== trimmedName && u.username !== trimmedUser);
      const updated = [...filtered, newAccount];
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      return updated;
    });

    showToast(`Added team member: ${trimmedName}`);

    executeCloud(async () => {
      await supabase.from('users').upsert({
        id: trimmedName,
        name: trimmedName,
        role: role === 'admin' ? 'founder' : 'outreach',
        avatar_url: JSON.stringify({
          username: trimmedUser,
          password: trimmedPass,
          role
        })
      });
      await refreshFromCloud();
    });
  };

  const removeTeamMember = async (idOrName: string) => {
    if (idOrName.toLowerCase() === 'abid') {
      showToast('Cannot remove Abid (primary admin)');
      return;
    }

    setUsersList((prev) => {
      const updated = prev.filter((u) => u.id !== idOrName && u.name !== idOrName);
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      return updated;
    });

    showToast(`Removed team member: ${idOrName}`);

    executeCloud(async () => {
      await supabase.from('users').delete().eq('id', idOrName);
      await refreshFromCloud();
    });
  };

  const updateUserAccount = async (
    id: string,
    updates: { name?: string; username?: string; password?: string; role?: UserRole }
  ) => {
    let updatedUser: UserAccount | undefined;

    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id || u.name === id) {
          updatedUser = {
            ...u,
            name: updates.name !== undefined ? updates.name.trim() : u.name,
            username: updates.username !== undefined ? updates.username.trim().toLowerCase() : u.username,
            password: updates.password !== undefined ? updates.password.trim() : u.password,
            role: updates.role !== undefined ? updates.role : u.role
          };
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      return updated;
    });

    if (updatedUser) {
      const targetUser = updatedUser;
      if (currentUser && (currentUser.id === id || currentUser.name === id)) {
        setCurrentUser(targetUser);
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(targetUser));
      }

      showToast(`Updated credentials for ${targetUser.name}`);

      executeCloud(async () => {
        await supabase.from('users').upsert({
          id: targetUser.id,
          name: targetUser.name,
          role: targetUser.role === 'admin' ? 'founder' : 'outreach',
          avatar_url: JSON.stringify({
            username: targetUser.username,
            password: targetUser.password,
            role: targetUser.role
          })
        });
        await refreshFromCloud();
      });
    }
  };

  // --- Lead CRUD ---
  const addLead = (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...data,
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: now,
      updated_at: now
    };

    setLeads((prev) => [newLead, ...prev]);

    const initAct: Activity = {
      id: 'act_' + Date.now(),
      lead_id: newLead.id,
      type: 'stage_change',
      text: `Lead created in ${newLead.stage} stage (${newLead.type}). Assigned to ${newLead.assigned_to}.`,
      created_at: now
    };
    setActivities((prev) => [initAct, ...prev]);

    showToast(`Lead created: ${newLead.business_name}`);

    executeCloud(async () => {
      if (newLead.assigned_to) {
        await supabase
          .from('users')
          .upsert({ id: newLead.assigned_to, name: newLead.assigned_to, role: 'outreach' });
      }
      await supabase.from('leads').insert(mapLeadToRow(newLead));
      await supabase.from('activities').insert({
        id: initAct.id,
        lead_id: initAct.lead_id,
        type: initAct.type,
        body: initAct.text,
        created_at: initAct.created_at
      });
    });

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const now = new Date().toISOString();
    let updatedLead: Lead | undefined;

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          updatedLead = { ...lead, ...updates, updated_at: now };
          return updatedLead;
        }
        return lead;
      })
    );

    if (updatedLead) {
      const target = updatedLead;
      executeCloud(async () => {
        const row = mapLeadToRow(target);
        await supabase.from('leads').update(row).eq('id', id);
      });
    }
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setActivities((prev) => prev.filter((a) => a.lead_id !== id));
    if (selectedLeadId === id) setSelectedLeadId(null);
    showToast('Lead deleted');

    executeCloud(async () => {
      await supabase.from('leads').delete().eq('id', id);
      await supabase.from('activities').delete().eq('lead_id', id);
    });
  };

  const setStage = (id: string, stage: LeadStage) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    const oldStage = lead.stage;
    const now = new Date().toISOString();

    updateLead(id, { stage });

    const act: Activity = {
      id: 'act_' + Date.now(),
      lead_id: id,
      type: 'stage_change',
      text: `Stage changed from ${oldStage} to ${stage}.`,
      created_at: now
    };
    setActivities((prev) => [act, ...prev]);

    executeCloud(async () => {
      await supabase.from('activities').insert({
        id: act.id,
        lead_id: act.lead_id,
        type: act.type,
        body: act.text,
        created_at: act.created_at
      });
    });

    if (stage === 'Won') {
      const existingClient = clients.find((c) => c.lead_id === id);
      if (!existingClient) {
        const newClient: Client = {
          id: 'client_' + Date.now(),
          lead_id: id,
          business_name: lead.business_name,
          type: lead.type,
          contract_value: lead.value || 0,
          notes: lead.angle || '',
          delivery_status: 'Not Started',
          created_at: now
        };
        setClients((prev) => [newClient, ...prev]);
        showToast(`🎉 Deal Won! Converted to Client: ${lead.business_name}`);

        executeCloud(async () => {
          await supabase.from('clients').insert(mapClientToRow(newClient));
        });
      }
    } else {
      showToast(`Stage updated to ${stage}`);
    }
  };

  const advanceStage = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    const currentIndex = PIPELINE_STAGES.indexOf(lead.stage);
    if (currentIndex >= 0 && currentIndex < PIPELINE_STAGES.length - 2) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1];
      setStage(id, nextStage);
    } else if (lead.stage === 'Negotiation') {
      setStage(id, 'Won');
    }
  };

  // --- Activities ---
  const getLeadActivities = (leadId: string): Activity[] => {
    return activities
      .filter((a) => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const addActivity = (leadId: string, type: ActivityType, text: string) => {
    const now = new Date().toISOString();
    const newAct: Activity = {
      id: 'act_' + Date.now(),
      lead_id: leadId,
      type,
      text,
      created_at: now
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast('Activity logged');

    executeCloud(async () => {
      await supabase.from('activities').insert({
        id: newAct.id,
        lead_id: newAct.lead_id,
        type: newAct.type,
        body: newAct.text,
        created_at: newAct.created_at
      });
    });
  };

  const logCall = (
    leadId: string,
    outcome: CallOutcome,
    notes: string,
    nextAction: string,
    nextActionDue: string
  ) => {
    const actText = notes ? `Call outcome: ${outcome}. Note: ${notes}` : `Call outcome: ${outcome}.`;
    addActivity(leadId, 'call', actText);

    updateLead(leadId, {
      next_action: nextAction,
      next_action_due: nextActionDue
    });

    showToast(`Call logged: ${outcome}`);
  };

  // --- Clients ---
  const updateClient = (id: string, updates: Partial<Client>) => {
    let updatedClient: Client | undefined;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedClient = { ...c, ...updates };
          return updatedClient;
        }
        return c;
      })
    );
    showToast('Client updated');

    if (updatedClient) {
      const target = updatedClient;
      executeCloud(async () => {
        await supabase.from('clients').update(mapClientToRow(target)).eq('id', id);
      });
    }
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        usersList,
        login,
        logout,
        currentView,
        setCurrentView,
        selectedLeadId,
        setSelectedLeadId,
        quickAddOpen,
        setQuickAddOpen,
        searchOpen,
        setSearchOpen,
        teamModalOpen,
        setTeamModalOpen,
        isSyncing,
        refreshFromCloud,
        leads,
        addLead,
        updateLead,
        deleteLead,
        advanceStage,
        setStage,
        activities,
        getLeadActivities,
        addActivity,
        logCall,
        clients,
        updateClient,
        teamMembers,
        addTeamMember,
        updateUserAccount,
        removeTeamMember,
        toast,
        showToast
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
