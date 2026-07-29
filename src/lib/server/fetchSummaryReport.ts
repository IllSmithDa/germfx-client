import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import type { ReportsSummaryResponse } from "@/types";
import { fetchWithRefresh } from "./fetchWithRefresh";

export async function getReportsSummary(): Promise<ReportsSummaryResponse> {
  const cookieStore = await cookies();
  const url = SERVER_PATHS.userReportsSummary();

  const response = await fetchWithRefresh(url, {
    method: "GET",
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      symptoms: {
        total_logs_last_7_days: 0,
        top_symptom_name: null,
        top_symptom_count: 0,
        avg_severity_last_7_days: null,
        change_vs_previous_7_days: null
      },
      medications: {
        total_tracked: 0,
        active_count: 0,
        longest_active_name: null,
        longest_active_days: null,
        most_recent_started_name: null
      },
      activity: {
        last_symptom_log_date: null,
        last_medication_start_date: null
      }
    }
  }

  return response.data as ReportsSummaryResponse;
}