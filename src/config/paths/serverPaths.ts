/* eslint-disable @typescript-eslint/no-unused-vars */
import { SavedItemsSort } from "@/types";
import { AdminBooleanFilter, AdminDrugDetailResyncParams, AdminDrugDetailsParams, AdminDrugIndexesParams, AdminUsersParams } from "@/types/admin";
import { AdminFeedbackParams } from "@/types/userFeedback";


const localhostUrl = "http://localhost:8000/api";
const renderTestUrl = "https://sidefx-fastapi-server.onrender.com/api";

const rawServerUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  localhostUrl;

const ROOT_SERVER_URL = rawServerUrl.replace(/\/$/, "");

export const SERVER_PATHS = {
  baseUrl: ROOT_SERVER_URL,

  // Auth
  register: `${ROOT_SERVER_URL}/auth/register`,
  login: `${ROOT_SERVER_URL}/auth/login`,
  logout: `${ROOT_SERVER_URL}/auth/logout`,
  refresh: `${ROOT_SERVER_URL}/auth/refresh`,
  me: `${ROOT_SERVER_URL}/auth/me`,
  // user details
  userDetails:`${ROOT_SERVER_URL}/users/user-detail`,

  drugSearch: (q: string, limit = 25) =>
    `${ROOT_SERVER_URL}/medications/drug-list-search?q=${encodeURIComponent(q)}&limit=${limit}`,


  // Medications (catalog + utilities)
  drugInfo: (drug: string) =>
    `${ROOT_SERVER_URL}/medications/drug-search?drug=${encodeURIComponent(drug)}`,

  getDrugByIndexId: (id: string) => `${ROOT_SERVER_URL}/medications/drug-detail-base?index_id=${encodeURIComponent(id)}`,
  getDrugWarnings: (qs: string) => `${ROOT_SERVER_URL}/medications/drug-warnings?${qs}`,
  postCleanDrugWarnings: (qs: string) => `${ROOT_SERVER_URL}/medications/drug-warnings/clean?${qs}`,
  medList: `${ROOT_SERVER_URL}/medications`, // GET list, POST create
  medicationSuggestions: (q: string, limit = 10) =>
    `${ROOT_SERVER_URL}/suggestions/medications?query=${encodeURIComponent(q)}&limit=${limit}`,

  // Symptoms (catalog suggestions)
  symptomSuggestions: (q: string, limit = 10) =>
    `${ROOT_SERVER_URL}/symptoms/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`,

  // -------- User-scoped resources (centralized in main.py) --------
  userMedications: (
    params?: {
      limit?: number;
      offset?: number;
      q?: string;
      active?: boolean;
      sort?: "latest" | "oldest" | "alphabetical" | "reverse_alphabetical";
    }
  ) => {
    const search = new URLSearchParams();

    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    if (params?.q) search.set("q", params.q);
    if (params?.active != null) search.set("active", String(params.active));
    if (params?.sort && params.sort !== "latest") search.set("sort", params.sort);

    const qs = search.toString();

    return `${ROOT_SERVER_URL}/user-medications${
      qs ? `?${qs}` : ""
    }`;
  },

  userMedicationContains: (drugIndexId: number | string) =>
    `${ROOT_SERVER_URL}/user-medications/contains?drug_index_id=${drugIndexId}`,

  editUserMedication: (userMedicationId: number | string) =>
    `${ROOT_SERVER_URL}/user-medications/${encodeURIComponent(String(userMedicationId))}`,
    // ✅ new helper

  deleteUserMedicationsById: (id: number | string) =>
    `${ROOT_SERVER_URL}/user-medications/${encodeURIComponent(String(id))}`,
  userMedicationByDetail: (drugDetailId: number | string) =>
    `${ROOT_SERVER_URL}/user-medications/by-detail/${drugDetailId}`,

  userSymptomLogs: (
    params?: {
      limit?: number;
      offset?: number;
      sort?: "latest" | "oldest" | "severity_low" | "severity_high";
      q?: string;
      date_from?: string;
      date_to?: string;
      min_severity?: number;
      user_medication_id?: number;
    }
  ) => {
    const search = new URLSearchParams();

    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    if (params?.sort && params.sort !== "latest") search.set("sort", params.sort);
    if (params?.q) search.set("q", params.q);
    if (params?.date_from) search.set("date_from", params.date_from);
    if (params?.date_to) search.set("date_to", params.date_to);
    if (params?.min_severity != null) {
      search.set("min_severity", String(params.min_severity));
    }
    if (params?.user_medication_id != null) {
      search.set("user_medication_id", String(params.user_medication_id));
    }

    const qs = search.toString();

    return `${ROOT_SERVER_URL}/symptom-logs${qs ? `?${qs}` : ""}`;
  },
  createSymptomLog: () => `${ROOT_SERVER_URL}/symptom-logs/`,
  userSymptomLogsBulk: () =>
    `${ROOT_SERVER_URL}/symptom-logs/bulk`,

  // Optional combined dashboard endpoint (if you added it)
  userOverview: (userId: number | string) =>
    `${ROOT_SERVER_URL}/users/${encodeURIComponent(String(userId))}/overview`,

   // ✅ NEW: edit single symptom log
  editUserSymptomLog: (
    symptomLogId: number | string
  ) =>
    `${ROOT_SERVER_URL}/symptom-logs/update-symptom/${encodeURIComponent(String(symptomLogId))}`,
  deleteUserSymptomLog: (
    symptomLogId: number | string
  ) =>
    `${ROOT_SERVER_URL}/symptom-logs/delete-symptom/${encodeURIComponent(String(symptomLogId))}`,

  userRecentSymptomNames: ( limit = 10) =>
    `${ROOT_SERVER_URL}/symptom-logs/recent-names?limit=${limit}`,
  userSymptomFrequency: () =>
    `${ROOT_SERVER_URL}/reports/symptom-frequency`,
  userMedicationUsageReport: () =>
    `${ROOT_SERVER_URL}/reports/medication-usage`,
  userReportsSummary: () =>
    `${ROOT_SERVER_URL}/reports/summary`,
  userSymptomContextReport: () =>
    `${ROOT_SERVER_URL}/reports/symptom-context`,
  drugDetailByCode: (code: string) =>
    `${ROOT_SERVER_URL}/medications/drug-detail-by-code?code=${encodeURIComponent(code)}`,
  pdfExportRoute: (userId: number | string, days = 30, topSymptomLimit = 5) =>
    `${ROOT_SERVER_URL}/reports/${encodeURIComponent(String(userId))}/export/pdf?days=${days}&top_symptom_limit=${topSymptomLimit}`,
  extractSideEffects: (qs: string) =>
    `${ROOT_SERVER_URL}/side-effects/extract?${qs}`,
  extractSafetyWarnings: (queryString: string) =>
    `${ROOT_SERVER_URL}/safety-warnings/extract?${queryString}`,
  syncOpenFda: `${ROOT_SERVER_URL}/internal/sync/openfda`,
  changeUsername: `${ROOT_SERVER_URL}/auth/change-username`,
  changeEmail: `${ROOT_SERVER_URL}/auth/change-email`,
  changePassword: `${ROOT_SERVER_URL}/auth/change-password`,
  forgotPassword: `${ROOT_SERVER_URL}/auth/forgot-password`,
  resetPassword: `${ROOT_SERVER_URL}/auth/reset-password`,
  deactivateAccount: `${ROOT_SERVER_URL}/auth/deactivate-account`,
  deleteAccount: `${ROOT_SERVER_URL}/auth/delete-account`,
  resendVerification: `${ROOT_SERVER_URL}/auth/resend`,
  reactivateAccount: `${ROOT_SERVER_URL}/auth/reactivate-account`,
  verifyEmail: (token: string) =>
  `${ROOT_SERVER_URL}/auth/verify?token=${encodeURIComponent(token)}`,

  verifyEmailChange: `${ROOT_SERVER_URL}/auth/verify-email-change`,
  articles: (
    page = 1,
    pageSize = 10,
    query?: string,
    sort?: "latest" | "popular" | "oldest"
  ) => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    if (query?.trim()) params.set("query", query.trim());
    if (sort && sort !== "latest") params.set("sort", sort);

    return `${ROOT_SERVER_URL}/articles?${params.toString()}`;
  },
  recalls: (params?: {
    limit?: number;
    skip?: number;
    source?: string;
    query?: string;
    state?: string;
    sort?: string
    type?: string;
    sync_if_needed?: boolean;
  }) => {
    const search = new URLSearchParams();

    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.skip != null) search.set("skip", String(params.skip));
    if (params?.source) search.set("source", params.source);
    if (params?.query) search.set("query", params.query);
    if (params?.state && params.state !== "all") search.set("state", params.state);
    if (params?.sort && params.sort !== "latest") search.set("sort", params.sort);
    if (params?.type && params.type !== "all") search.set("type", params.type);
    if (params?.sync_if_needed != null) {
      search.set("sync_if_needed", String(params.sync_if_needed));
    }

    const qs = search.toString();
    return `${ROOT_SERVER_URL}/recalls${qs ? `?${qs}` : ""}`;
  },

  syncRecalls: () => `${ROOT_SERVER_URL}/recalls/sync`,

  // Stored content detail by database ID.
  contentDetail: (
    contentType: "news" | "recall",
    contentId: string | number,
  ) =>
    `${ROOT_SERVER_URL}/content-detail/item/${encodeURIComponent(
      contentType,
    )}/${encodeURIComponent(String(contentId))}`,

  newsDetail: (articleId: string | number) =>
    `${ROOT_SERVER_URL}/content-detail/item/news/${encodeURIComponent(
      String(articleId),
    )}`,

  recallDetail: (recallId: string | number) =>
    `${ROOT_SERVER_URL}/content-detail/item/recall/${encodeURIComponent(
      String(recallId),
    )}`,

  savedItems: (params?: {
    content_type?: "news" | "recall";
    query?: string;
    sort?: SavedItemsSort;
    limit?: number;
    skip?: number;
  }) => {
    const search = new URLSearchParams();
  
    if (params?.content_type) search.set("content_type", params.content_type);
    if (params?.query) search.set("query", params.query);
    if (params?.sort && params.sort !== "newest") search.set("sort", params.sort);
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.skip != null) search.set("skip", String(params.skip));
  
    const qs = search.toString();
    return `${ROOT_SERVER_URL}/saved-items${qs ? `?${qs}` : ""}`;
  },

  checkSavedItem: (contentType: "news" | "recall", sourceItemId: number) =>
    `${ROOT_SERVER_URL}/saved-items/check?content_type=${encodeURIComponent(
      contentType
    )}&source_item_id=${encodeURIComponent(String(sourceItemId))}`,

  deleteSavedItem: (savedItemId: number) =>
    `${ROOT_SERVER_URL}/saved-items/${savedItemId}`,

  // SERVER_PATHS

  reactionSummary: (contentType: "news" | "recall", sourceItemId: number) =>
    `${ROOT_SERVER_URL}/reactions/summary?content_type=${contentType}&source_item_id=${sourceItemId}`,

  toggleReaction: () => `${ROOT_SERVER_URL}/reactions/toggle`,

  deleteReaction: (contentType: "news" | "recall", sourceItemId: number) =>
    `${ROOT_SERVER_URL}/reactions?content_type=${contentType}&source_item_id=${sourceItemId}`,

  checkSavedItemsBulk: (contentType: "news" | "recall", ids: number[]) =>
  `${ROOT_SERVER_URL}/saved-items/check/bulk?content_type=${contentType}&ids=${ids.join(",")}`,

  reactionSummaryBulk: (contentType: "news" | "recall", ids: number[]) =>
  `${ROOT_SERVER_URL}/reactions/summary/bulk?content_type=${contentType}&ids=${ids.join(",")}`,
  userSettings: `${ROOT_SERVER_URL}/user-settings`,

  resetUserSettings: `${ROOT_SERVER_URL}/user-settings/reset`,
  lastUsedMedicationId: () =>
    `${ROOT_SERVER_URL}/symptom-logs/last-medication-id`,
  pdfDrugDetails: (detailID: string | number) =>
    `${ROOT_SERVER_URL}/drug-details/${encodeURIComponent(String(detailID))}/export/pdf`,
  handlePayment: () => 
    `${ROOT_SERVER_URL}/`,
  drugIndexByCode: (
    code: string,
    params?: {
      limit?: number;
      stale_after_days?: number;
      force_resync?: boolean;
    }
  ) => {
    const search = new URLSearchParams();
  
    search.set("code", code);
  
    if (params?.limit != null) {
      search.set("limit", String(params.limit));
    }
  
    if (params?.stale_after_days != null) {
      search.set(
        "stale_after_days",
        String(params.stale_after_days)
      );
    }
  
    if (params?.force_resync != null) {
      search.set(
        "force_resync",
        String(params.force_resync)
      );
    }
  
    return `${ROOT_SERVER_URL}/medications/drug-index-by-code?${search.toString()}`;
  },
  adminStatus: () => `${ROOT_SERVER_URL}/admin/users/me/admin-status`,
  adminUsers: (params?: AdminUsersParams) => {
    const search = new URLSearchParams();

    if (params?.query) {
      search.set("query", params.query);
    }

    if (params?.status && params.status !== "all") {
      search.set("status", params.status);
    } else {
      search.set("status", "all");
    }

    if (params?.include_admins != null) {
      search.set("include_admins", String(params.include_admins));
    }

    search.set("page", String(params?.page ?? 1));
    search.set("page_size", String(params?.page_size ?? 25));

    return `${ROOT_SERVER_URL}/admin/users?${search.toString()}`;
  },
  adminAssignUserRole: () =>
    `${ROOT_SERVER_URL}/admin/users/assign-role`,
  adminSuspendUser: () =>
    `${ROOT_SERVER_URL}/admin/users/suspend`,
  adminUnsuspendUser: () =>
    `${ROOT_SERVER_URL}/admin/users/unsuspend`,
  adminDrugIndexes: (
    params?: AdminDrugIndexesParams
  ) => {
    const search = new URLSearchParams();

    if (params?.q) {
      search.set("q", params.q);
    }

    if (params?.kind) {
      search.set("kind", params.kind);
    }

    if (params?.source) {
      search.set("source", params.source);
    }

    if (params?.manufacturer) {
      search.set(
        "manufacturer",
        params.manufacturer
      );
    }

    if (params?.has_upc != null) {
      search.set(
        "has_upc",
        String(params.has_upc)
      );
    }

    if (params?.has_ndc != null) {
      search.set(
        "has_ndc",
        String(params.has_ndc)
      );
    }

    if (params?.has_latest_detail != null) {
      search.set(
        "has_latest_detail",
        String(params.has_latest_detail)
      );
    }
    if (params?.sync_openfda != null) {
      search.set(
        "sync_openfda",
        String(params.sync_openfda)
      );
    }

    if (params?.openfda_limit != null) {
      search.set(
        "openfda_limit",
        String(params.openfda_limit)
      );
    }

    search.set(
      "page",
      String(params?.page ?? 1)
    );

    search.set(
      "page_size",
      String(params?.page_size ?? 25)
    );

    search.set(
      "sort",
      params?.sort ?? "updated_asc"
    );

    return `${ROOT_SERVER_URL}/admin/drug-indexes?${search.toString()}`;
  },
  adminDrugIndexCodes: (
    drugIndexId: number | string
  ) =>
    `${ROOT_SERVER_URL}/admin/drug-indexes/${encodeURIComponent(
      String(drugIndexId)
    )}/codes`,
  adminDrugDetails: (params?: AdminDrugDetailsParams) => {
    const search = new URLSearchParams();

    const setBooleanFilter = (
      key: "has_warnings" | "has_clean_fields",
      value?: AdminBooleanFilter,
    ) => {
      if (value == null || value === "all") {
        return;
      }

      if (value === "yes") {
        search.set(key, "true");
        return;
      }

      if (value === "no") {
        search.set(key, "false");
        return;
      }

      search.set(key, String(value));
    };

    if (params?.query) {
      search.set("query", params.query);
    }

    setBooleanFilter("has_warnings", params?.has_warnings);
    setBooleanFilter("has_clean_fields", params?.has_clean_fields);

    if (params?.source) {
      search.set("source", params.source);
    }

    search.set("sort", params?.sort ?? "updated_desc");
    search.set("page", String(params?.page ?? 1));
    search.set("page_size", String(params?.page_size ?? 25));

    return `${ROOT_SERVER_URL}/admin/drug-details?${search.toString()}`;
  },
  adminDrugDetail: (detailId: number | string) =>
    `${ROOT_SERVER_URL}/admin/drug-details/${encodeURIComponent(
      String(detailId)
    )}`,
  adminDrugDetailResync: (
    detailId: number | string,
    params?: AdminDrugDetailResyncParams,
  ) => {
    const search = new URLSearchParams();

    if (params?.drug) {
      search.set("drug", params.drug);
    }

    if (params?.make_latest != null) {
      search.set("make_latest", String(params.make_latest));
    }

    if (params?.reset_clean_fields != null) {
      search.set(
        "reset_clean_fields",
        String(params.reset_clean_fields),
      );
    }

    const qs = search.toString();

    return `${ROOT_SERVER_URL}/admin/drug-details/${encodeURIComponent(
      String(detailId)
    )}/resync${qs ? `?${qs}` : ""}`;
  },

  // Feedback
  feedback: () => `${ROOT_SERVER_URL}/feedback`,

  myFeedback: () => `${ROOT_SERVER_URL}/feedback/me`,

  feedbackItem: (feedbackId: string | number) =>
    `${ROOT_SERVER_URL}/feedback/${encodeURIComponent(String(feedbackId))}`,

  adminFeedback: (params?: AdminFeedbackParams) => {
    const search = new URLSearchParams();

    search.set("page", String(params?.page ?? 1));
    search.set("page_size", String(params?.page_size ?? 25));

    if (params?.category && params.category !== "all") {
      search.set("category", params.category);
    }

    if (params?.rating != null && params.rating !== "all") {
      search.set("rating", String(params.rating));
    }

    if (params?.query?.trim()) {
      search.set("query", params.query.trim());
    }

    if (params?.user_id != null) {
      search.set("user_id", String(params.user_id));
    }

    if (params?.sort && params.sort !== "created_desc") {
      search.set("sort", params.sort);
    }

    const qs = search.toString();

    return `${ROOT_SERVER_URL}/admin/feedback${qs ? `?${qs}` : ""}`;
  },
    // Billing
  billingCheckout: `${ROOT_SERVER_URL}/billing/checkout`,
  paddleWebhook: `${ROOT_SERVER_URL}/billing/webhook/paddle`,
  // Admin usage limits
  adminUsageLimits: `${ROOT_SERVER_URL}/admin/usage-limits`,

  adminUsageLimit: (featureKey: string) =>
    `${ROOT_SERVER_URL}/admin/usage-limits/${encodeURIComponent(featureKey)}`,

  adminUsageLimitSeedDefaults: (overwrite = false) =>
    `${ROOT_SERVER_URL}/admin/usage-limits/seed-defaults?overwrite=${String(
      overwrite,
    )}`,
  usageLimitStatus: (featureKey: string) =>
  `${ROOT_SERVER_URL}/usage-limits?feature_key=${encodeURIComponent(featureKey)}`,

  usageLimitStatusAll: () =>
  `${ROOT_SERVER_URL}/usage-limits/all`  ,
};