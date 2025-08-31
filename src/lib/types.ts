
export type ProspectStatus = 'New' | 'Contacted' | 'In-Progress' | 'Won' | 'Lost';
export type WarmColdStatus = 'Hot' | 'Cold';
export type ProspectSource = string;

export interface Prospect {
  id: string;
  name: string;
  source: ProspectSource;
  date_added: string; // ISO string
  current_status: ProspectStatus;
  last_contact_date?: string; // ISO string
  follow_up_date?: string; // ISO string
  notes: string;
  warm_cold_status: WarmColdStatus;
  objections?: string;
  pain_points?: string;
  created_at: string; // ISO string
}

export interface ProspectOptions {
    sources: string[];
    statuses: string[];
}
