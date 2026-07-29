import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "./fetchWithRefresh";
import {
  MedicationUsageReportItem,
  SymptomFrequencyReportItem,
} from "@/types";
import { SymptomContextReportItem } from "@/types/symptomLogs";

export type ReportRange = "7d" | "30d" | "90d" | "all";

export type ReportDateOptions = {
  range?: ReportRange;
  start_date?: string;
  end_date?: string;
};

export type SymptomFrequencyOptions = ReportDateOptions & {
  limit?: number;
};

export type ReportFetchResult<T> = {
  ok: boolean;
  data: T;
  error?: string;
  status?: number;
};

function appendReportParams(
  params: URLSearchParams,
  options?: ReportDateOptions
) {
  if (!options) return;

  if (options.range && options.range !== "all") {
    params.set("range", options.range);
  }

  if (options.start_date) params.set("start_date", options.start_date);
  if (options.end_date) params.set("end_date", options.end_date);
}

function getReportError(
  result: { error?: string; status?: number; data?: unknown },
  fallback: string
) {
  if (result.error) return result.error;

  if (result.status) {
    return `${fallback} Status: ${result.status}`;
  }

  return fallback;
}

export async function getSymptomFrequencyReport(
  options?: SymptomFrequencyOptions
): Promise<ReportFetchResult<SymptomFrequencyReportItem[]>> {
  const params = new URLSearchParams();

  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }

  appendReportParams(params, options);

  const baseUrl = SERVER_PATHS.userSymptomFrequency();
  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  const result = await fetchWithRefresh<SymptomFrequencyReportItem[]>(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!result.ok || !Array.isArray(result.data)) {
    return {
      ok: false,
      data: [],
      status: result.status,
      error: getReportError(result, "Failed to load symptom report."),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}

export async function getMedicationUsageReport(
  options?: ReportDateOptions
): Promise<ReportFetchResult<MedicationUsageReportItem[]>> {
  const params = new URLSearchParams();

  appendReportParams(params, options);

  const baseUrl = SERVER_PATHS.userMedicationUsageReport();
  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  const result = await fetchWithRefresh<MedicationUsageReportItem[]>(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!result.ok || !Array.isArray(result.data)) {
    return {
      ok: false,
      data: [],
      status: result.status,
      error: getReportError(result, "Failed to load medication report."),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}

export async function getSymptomContextReport(params?: {
  limit?: number;
  context_limit?: number;
  range?: ReportRange;
  start_date?: string;
  end_date?: string;
}): Promise<ReportFetchResult<SymptomContextReportItem[]>> {
  const search = new URLSearchParams();

  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.context_limit != null) {
    search.set("context_limit", String(params.context_limit));
  }

  appendReportParams(search, params);

  const baseUrl = SERVER_PATHS.userSymptomContextReport();
  const url = search.toString() ? `${baseUrl}?${search.toString()}` : baseUrl;

  const result = await fetchWithRefresh<SymptomContextReportItem[]>(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!result.ok || !Array.isArray(result.data)) {
    return {
      ok: false,
      data: [],
      status: result.status,
      error: getReportError(result, "Failed to load symptom context report."),
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}