import { AdminDrugIndexesParams } from "@/types/admin";

export const CLIENT_PATHS = {
  drugInfoPath: (drugIndexId: string | number, drugName: string) => {
    let safeName = drugName;
    try {
      safeName = decodeURIComponent(drugName);
    } catch {
      // If it's not encoded, decodeURIComponent will throw — ignore
    }
    return `/drug/${encodeURIComponent(drugIndexId)}/${encodeURIComponent(safeName)}`
  },
  medListPath: () => "/medications",
  symptomSuggestionsPath: (q: string, limit = 10) =>
    `/symptoms/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`,
  addMedicationPath: () => "/add-medication",
  logSymptomsPath: () => "/log-symptom",
  homePath: () => "/",
  clientRegisterPath: () => "/register",
  clientLoginPath: () => "/login",
  searchResultsPath: (q: string) => `/drug-search-result/${encodeURIComponent(q)}`,
  drugSearchPage: () => "/drug-search",
  newsPage: (page = 1) => `/news?page=${page}`,
  recallPage: (page = 1) => `/recalls?page=${page}`,
  drugCodeSearchPath: (code: string) =>`/drug-code-search/${encodeURIComponent(code)}`,
  userMedicationsPath: () => "/user-medications",
  symptomLogsPath: () => "/symptom-logs",
  adminHomePath: () => "/admin",
  adminUsersPath: () => "/admin/users",
  adminDrugIndexCodesPath: (
    params?: Pick<
      AdminDrugIndexesParams,
      "page" | "page_size" | "sort" | "kind"
    >,
  ) => {
    const search = new URLSearchParams();

    if (params?.page != null) {
      search.set("page", String(params.page));
    }

    if (params?.page_size != null) {
      search.set("page_size", String(params.page_size));
    }

    if (params?.sort) {
      search.set("sort", params.sort);
    }

    if (params?.kind) {
      search.set("kind", params.kind);
    }

    const qs = search.toString();

    return `/admin/drug-index-codes${qs ? `?${qs}` : ""}`;
  },
  adminDrugIndexCodesSearchPath: (
    params?: Pick<
      AdminDrugIndexesParams,
      "q" | "page" | "page_size" | "sort" | "kind"
    >,
  ) => {
    const search = new URLSearchParams();

    if (params?.q) {
      search.set("q", params.q);
    }

    if (params?.page != null) {
      search.set("page", String(params.page));
    }

    if (params?.page_size != null) {
      search.set("page_size", String(params.page_size));
    }

    if (params?.sort) {
      search.set("sort", params.sort);
    }

    if (params?.kind) {
      search.set("kind", params.kind);
    }

    const qs = search.toString();

    return `/admin/drug-index-codes/search${qs ? `?${qs}` : ""}`;
  },
  adminDrugDetailsPath: () => "/admin/drug-details",
  adminDrugDetailPath: (detailId: string | number) =>
    `/admin/drug-details/${encodeURIComponent(String(detailId))}`,
  adminUsageLimitsPath: () => "/admin/usage-limits",

  // Client-side API proxy paths. Use these from browser-side fetch helpers.
  adminUsersApiPath: () => "/api/backend/admin/users",
  adminAssignUserRoleApiPath: () => "/api/backend/admin/users/assign-role",
  adminSuspendUserApiPath: () => "/api/backend/admin/users/suspend",
  adminUnsuspendUserApiPath: () => "/api/backend/admin/users/unsuspend",
  adminDrugDetailsApiPath: () => "/api/backend/admin/drug-details",
  adminDrugDetailApiPath: (detailId: string | number) =>
    `/api/backend/admin/drug-details/${encodeURIComponent(String(detailId))}`,
  adminDrugDetailResyncApiPath: (detailId: string | number) =>
    `/api/backend/admin/drug-details/${encodeURIComponent(String(detailId))}/resync`,
  pricingPath: () => "/pricing",
  billingCheckoutPath: () => "/billing/checkout",
  billingSuccessPath: () => "/billing/success",
  verifyEmailPath: (token?: string) =>
    token
    ? `/verify-email?token=${encodeURIComponent(token)}`
    : "/verify-email",

  verifyEmailChangePath: (token?: string) =>
    token
    ? `/verify-email-change?token=${encodeURIComponent(token)}`
    : "/verify-email-change",
  usageLimitStatusPath: (featureKey: string) =>
    `/api/usage-limits/status?feature_key=${encodeURIComponent(featureKey)}`,

  usageLimitStatusAllPath: () => "/api/usage-limits/status/all",

  pdfDrugDetailsProxy: (detailID: string | number) =>
    `/api/drug-details/${encodeURIComponent(String(detailID))}/pdf`,
  adminDrugDetailCuratedFieldsApiPath: (detailId: string | number) =>
    `/api/backend/admin/drug-details/${encodeURIComponent(String(detailId))}/curated-fields`,
  feedbackPagePath: () => "/feedback",
  myFeedbackPath: () => "/feedback/me",
  adminFeedbackPath: () => "/admin/feedback",
  accountsPath: () => "/account",
  settingsPath: () => "settings",
  bookmarksPath: () => "/bookmarks",
  reportsPath: () => "/reports",
  aboutPath: () => "/about"
};