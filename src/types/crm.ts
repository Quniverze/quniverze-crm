/**
 * QUNIVERZE CRM: TYPE DEFINITIONS
 */

export type UserRole = 'founder' | 'outreach';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export type LeadStatus =
  | 'New'
  | 'To Call'
  | 'Contacted'
  | 'Interested'
  | 'Qualified'
  | 'Meeting'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  instagram?: string;
  industry: string;
  location: string;
  lead_source: string;
  status: LeadStatus;
  assigned_to: string; // user id
  description?: string;
  observation?: string;
  notes?: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
  created_at: string;
  updated_at: string;
}

export type OpportunityStage =
  | 'Qualified'
  | 'Meeting'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Opportunity {
  id: string;
  lead_id: string;
  estimated_value: number;
  probability: number;
  stage: OpportunityStage;
  assigned_to: string;
  next_action?: string;
  next_follow_up_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  lead_id?: string;
  opportunity_id?: string;
  assigned_to: string;
  due_at: string;
  action: string;
  status: FollowUpStatus;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export type ActivityType =
  | 'created'
  | 'researched'
  | 'called'
  | 'outcome'
  | 'whatsapp'
  | 'meeting'
  | 'proposal'
  | 'stage_changed'
  | 'converted'
  | 'note';

export interface Activity {
  id: string;
  lead_id?: string;
  opportunity_id?: string;
  client_id?: string;
  person_id?: string;
  type: ActivityType;
  body: string;
  created_at: string;
}

export type ClientStatus = 'active' | 'completed' | 'paused';

export interface Client {
  id: string;
  lead_id?: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email?: string;
  project: string;
  value: number;
  status: ClientStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CallOutcome =
  | 'No Answer'
  | 'Busy'
  | 'Wrong Number'
  | 'Not Interested'
  | 'Interested'
  | 'Call Later'
  | 'WhatsApp Sent'
  | 'Meeting Requested';

export type FollowUpTimingOption = 'Tomorrow' | '3 Days' | '7 Days' | 'Custom';
