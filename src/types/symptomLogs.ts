export type SymptomLogSort =
  | "latest"
  | "oldest"
  | "severity_low"
  | "severity_high";

export type SymptomLogListItem = {
  id: number | string;

  // date stored as YYYY-MM-DD
  date: string;

  // original user text
  symptom_text: string;

  // optional normalized symptom
  symptom?: {
    id?: number;
    term?: string | null;
  } | null;

  user_medication_id?: number | string | null;

  // optional related medication
  user_medication?: {
    id?: number;
    name?: string | null;
    nickname?: string | null;
  } | null;

  severity?: number | null;

  details?: string | null;

  created_at?: string | null;

  possible_trigger?: string | null;
  management_strategy?: string | null;
};
export type SymptomPoint = {
  date: string;
  score: number;
};
export type ApiSymptomLogs = {
  items: Array<{
    id: number;
    date: string;
    symptom_text: string;
    user_medication_id?: number | null;
    user_medication?: {
      id: number;
      name: string | null;
      nickname?: string | null;
    } | null;
    severity?: number | null;
    details?: string | null;
    created_at?: string | null;
    symptom?: { id: number; term: string } | null;
    possible_trigger?: string | null;
    management_strategy?: string | null;
  }>;
  total: number;
};

export type FetchSymptomLogsParams = {
  limit?: number;
  offset?: number;
  sort?: SymptomLogSort;
  q?: string;
  date_from?: string;
  date_to?: string;
  min_severity?: number;
  user_medication_id?: number;
  possible_trigger?: string | null;
  management_strategy?: string | null;
};

export type SymptomLogsPageResponse = {
  logs: SymptomLogListItem[];
  series: SymptomPoint[];
  total: number;
  limit: number;
  offset: number;
  sort: SymptomLogSort;
};

export type SymptomContextReportItem = {
  symptom_text: string;
  possible_triggers: string[];
  management_strategies: string[];
};