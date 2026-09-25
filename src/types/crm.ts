/**
 * QUNIVERZE CRM: MINIMAL DATA MODEL
 * Product (NivaOps) & Client Work
 */

export type LeadType = 'Product' | 'Client Work';

export type LeadStage =
  | 'New'
  | 'Qualified'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  city: string;
  type: LeadType;
  stage: LeadStage;
  assigned_to: string; // Abid or any team member name
  angle: string; // The pitch / reason this lead is worth pursuing
  next_action: string;
  next_action_due: string; // YYYY-MM-DD
  value?: number; // Estimated deal / contract value
  created_at: string;
  updated_at: string;
}

export type ActivityType = 'call' | 'note' | 'stage_change';

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  text: string;
  created_at: string;
}

export type DeliveryStatus = 'Not Started' | 'In Progress' | 'Delivered' | 'Active';

export interface Client {
  id: string;
  lead_id: string;
  business_name: string;
  type: LeadType;
  contract_value: number;
  notes: string;
  delivery_status: DeliveryStatus;
  created_at: string;
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

export type CRMView = 'today' | 'leads' | 'followups' | 'pipeline' | 'clients';

export const PIPELINE_STAGES: LeadStage[] = [
  'New',
  'Qualified',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

export const CALL_OUTCOMES: CallOutcome[] = [
  'No Answer',
  'Busy',
  'Wrong Number',
  'Not Interested',
  'Interested',
  'Call Later',
  'WhatsApp Sent',
  'Meeting Requested'
];
