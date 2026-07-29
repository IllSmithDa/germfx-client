import { SERVER_PATHS } from "@/config/paths";
import { ApiSymptomLogs, FetchSymptomLogsParams, SymptomLogListItem, SymptomLogsPageResponse, SymptomPoint } from "@/types/symptomLogs";
import { fetchWithRefresh } from "./fetchWithRefresh";

function mapLogsForList(api: ApiSymptomLogs["items"]): SymptomLogListItem[] {
  return api.map((log) => ({
    id: String(log.id),
    date: log.date,
    symptom_text: log.symptom?.term ?? log.symptom_text,
    user_medication_id:
      log.user_medication_id ?? log.user_medication?.id ?? null,
    user_medication: log.user_medication
      ? {
          id: log.user_medication.id,
          name: log.user_medication.name,
          nickname: log.user_medication.nickname ?? null,
        }
      : null,
    severity: typeof log.severity === "number" ? log.severity : null,
    details: log.details ?? null,
    created_at: log.created_at ?? null,
    possible_trigger: log.possible_trigger ?? null,
    management_strategy: log.management_strategy ?? null,
  }));
}

function buildWeeklySeries(api: ApiSymptomLogs["items"]): SymptomPoint[] {
  const byWeek = new Map<string, { total: number; count: number }>();

  for (const log of api) {
    if (typeof log.severity !== "number") continue;

    const d = new Date(`${log.date}T00:00:00`);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());

    const key = weekStart.toISOString().slice(0, 10);
    const agg = byWeek.get(key) ?? { total: 0, count: 0 };

    agg.total += log.severity;
    agg.count += 1;
    byWeek.set(key, agg);
  }

  return Array.from(byWeek.entries())
    .map(([date, agg]) => ({
      date,
      score: agg.count ? Math.round((agg.total / agg.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
}

function buildSymptomLogsUrl(
  params?: FetchSymptomLogsParams
) {
  const search = new URLSearchParams();

  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.sort && params.sort !== "latest") {
    search.set("sort", params.sort);
  }
  if (params?.q) search.set("q", params.q);
  if (params?.date_from) search.set("date_from", params.date_from);
  if (params?.date_to) search.set("date_to", params.date_to);
  if (params?.min_severity != null) {
    search.set("min_severity", String(params.min_severity));
  }
  if (params?.user_medication_id != null) {
    search.set("user_medication_id", String(params.user_medication_id));
  }

  const baseUrl = SERVER_PATHS.userSymptomLogs(params);
  const qs = search.toString();

  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export async function fetchSymptomLogs(
): Promise<{
  logs: SymptomLogListItem[];
  series: SymptomPoint[];
}> {
  const response = await fetchWithRefresh(buildSymptomLogsUrl(), {
    cache: "no-store",
  });

  if (!response.ok) return { logs: [], series: [] };

  const json = (await response.data) as ApiSymptomLogs;

  return {
    logs: mapLogsForList((json.items ?? []).slice(0, 100)),
    series: buildWeeklySeries(json.items ?? []),
  };
}

export async function fetchSymptomLogsPage(
  params?: FetchSymptomLogsParams
): Promise<SymptomLogsPageResponse> {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  const sort = params?.sort ?? "latest";

  const response = await fetchWithRefresh(
    buildSymptomLogsUrl({
      ...params,
      limit,
      offset,
      sort,
    }),
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      logs: [],
      series: [],
      total: 0,
      limit,
      offset,
      sort,
    };
  }

  const json = (await response.data) as ApiSymptomLogs;

  return {
    logs: mapLogsForList(json.items ?? []),
    series: buildWeeklySeries(json.items ?? []),
    total: json.total ?? 0,
    limit,
    offset,
    sort,
  };
}
