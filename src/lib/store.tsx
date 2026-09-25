'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  LeadStage,
  Activity,
  ActivityType,
  Client,
  CallOutcome,
  CRMView,
  PIPELINE_STAGES
} from '@/types/crm';

interface CRMContextType {
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
  addTeamMember: (name: string) => void;
  removeTeamMember: (name: string) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

const STORAGE_KEYS = {
  LEADS: 'quniverze_crm_leads',
  ACTIVITIES: 'quniverze_crm_activities',
  CLIENTS: 'quniverze_crm_clients',
  TEAM: 'quniverze_crm_team',
  VIEW: 'quniverze_crm_view'
};

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<CRMView>('today');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Core Data initialized empty (Zero demo data)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>(['Abid']);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (storedLeads) setLeads(JSON.parse(storedLeads));

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (storedClients) setClients(JSON.parse(storedClients));

      const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (storedTeam) {
        const parsed = JSON.parse(storedTeam);
        if (Array.isArray(parsed) && parsed.length > 0) setTeamMembers(parsed);
      }

      const storedView = localStorage.getItem(STORAGE_KEYS.VIEW) as CRMView | null;
      if (storedView) setCurrentView(storedView);
    } catch (e) {
      console.error('Failed to load CRM state from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads', e);
    }
  }, [leads, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities', e);
    }
  }, [activities, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to save clients', e);
    }
  }, [clients, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teamMembers));
    } catch (e) {
      console.error('Failed to save team', e);
    }
  }, [teamMembers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, currentView);
    } catch (e) {
      console.error('Failed to save view', e);
    }
  }, [currentView, isLoaded]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Lead CRUD
  const addLead = (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...data,
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: now,
      updated_at: now
    };

    setLeads((prev) => [newLead, ...prev]);

    // Initial activity
    const initAct: Activity = {
      id: 'act_' + Date.now(),
      lead_id: newLead.id,
      type: 'stage_change',
      text: `Lead created in ${newLead.stage} stage (${newLead.type}). Assigned to ${newLead.assigned_to}.`,
      created_at: now
    };
    setActivities((prev) => [initAct, ...prev]);

    showToast(`Lead created: ${newLead.business_name}`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const now = new Date().toISOString();
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updates, updated_at: now } : lead))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setActivities((prev) => prev.filter((a) => a.lead_id !== id));
    if (selectedLeadId === id) setSelectedLeadId(null);
    showToast('Lead deleted');
  };

  const setStage = (id: string, stage: LeadStage) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    const oldStage = lead.stage;
    const now = new Date().toISOString();

    updateLead(id, { stage });

    // Activity
    const act: Activity = {
      id: 'act_' + Date.now(),
      lead_id: id,
      type: 'stage_change',
      text: `Stage changed from ${oldStage} to ${stage}.`,
      created_at: now
    };
    setActivities((prev) => [act, ...prev]);

    // Auto-create client on "Won"
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
      // Advance to next stage before Won/Lost
      const nextStage = PIPELINE_STAGES[currentIndex + 1];
      setStage(id, nextStage);
    } else if (lead.stage === 'Negotiation') {
      setStage(id, 'Won');
    }
  };

  // Activities
  const getLeadActivities = (leadId: string): Activity[] => {
    return activities
      .filter((a) => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const addActivity = (leadId: string, type: ActivityType, text: string) => {
    const newAct: Activity = {
      id: 'act_' + Date.now(),
      lead_id: leadId,
      type,
      text,
      created_at: new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast('Activity logged');
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

  // Clients
  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Client updated');
  };

  // Team
  const addTeamMember = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || teamMembers.includes(trimmed)) return;
    setTeamMembers((prev) => [...prev, trimmed]);
    showToast(`Added team member: ${trimmed}`);
  };

  const removeTeamMember = (name: string) => {
    if (name === 'Abid') {
      showToast('Cannot remove Abid (primary admin)');
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m !== name));
    showToast(`Removed team member: ${name}`);
  };

  return (
    <CRMContext.Provider
      value={{
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
