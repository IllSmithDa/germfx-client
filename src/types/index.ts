// components/dashboard/types.ts


export type User = {
  id?: number | string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: "user" | "admin" | string;
};

export type SymptomPoint = { date: string; score: number }; // 0–10 severity

export type SymptomSeries = {
  medicationId: string;
  symptom: string;           // e.g., "nausea"
  points: SymptomPoint[];
};

export type SymptomLog = {
  id: string;
  date: string;
  medication: string;
  symptom: string;
  severity: number;          // 1–10
  note?: string;
  possible_trigger?: string | null;
  management_strategy?: string | null;
};

export type Insight = { id: string; title: string; detail: string };

export type DrugDetail = {
  id: number;
  name: string;
  normalized_name: string;
  side_effects?: string[];
  warnings_key?: Record<string, string | string[]>;
  warnings_simple?: string[];
  created_at: string;
  updated_at: string;
}


export type MedOption = {
  id: number;
  name: string;
  nickname?: string | null;
};

export type SymptomFrequencyReportItem = {
  symptom_text: string;
  count: number;
  avg_severity: number | null;
};

export type GetSymptomFrequencyReportOptions = {
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type MedicationUsageReportItem = {
  user_medication_id: number;
  name: string;
  nickname?: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  total_days_used: number | null;
};


export type ReportsSummaryResponse = {
  symptoms: {
    total_logs_last_7_days: number;
    top_symptom_name: string | null;
    top_symptom_count: number;
    avg_severity_last_7_days: number | null;
    change_vs_previous_7_days: number | null;
  };
  medications: {
    total_tracked: number;
    active_count: number;
    longest_active_name: string | null;
    longest_active_days: number | null;
    most_recent_started_name: string | null;
  };
  activity: {
    last_symptom_log_date: string | null;
    last_medication_start_date: string | null;
  };
};

export type ChangeUsernamePayload = {
  new_username: string;
};

export type ChangeEmailPayload = {
  current_password: string;
  new_email: string;
  confirm_new_email: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export type AccountActionResult = {
  ok: boolean;
  message: string;
};

export type SavedItemsSort ="newest" | "oldest" | "title_asc" | "title_desc";