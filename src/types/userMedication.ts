// Centralized types for the app, especially those shared between server and client components.
export type UserMedication = {
  id: number | string;
  name: string;
  nickname?: string | null;
  user_id: number | string;
  drug_detail_id: number | string;
  drug_index_id: number | string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  tracking_purpose?: TrackingPurpose | string | null;
};


// id does not exist on the form, but we need it for the payload when adding a medication, so we can return it from the server and use it in the optimistic update
export type UserMedicationPayload = {
  name: string;
  user_id: number | string;
  drug_detail_id: number | string;
  drug_index_id: number | string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
  nickname?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  frequency_preset?: string | null;
  frequency_other?: string | null;
  route_preset?: string | null;
  route_other?: string | null;
  tracking_purpose?: TrackingPurpose | string | null;
}


export type UserMedicationSort =
  | "latest"
  | "oldest"
  | "alphabetical"
  | "reverse_alphabetical";

export type TrackingPurpose =
  | "active_use"
  | "inactive_history"
  | "education"
  | "considering"
  | "other";