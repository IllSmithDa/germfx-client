import { AdminFeedbackParams } from "@/types/userFeedback";


const BACKEND_PROXY_ROOT = "/api/backend";

function buildAdminFeedbackQuery(params?: AdminFeedbackParams) {
  const search = new URLSearchParams();

  search.set("page", String(params?.page ?? 1));
  search.set("page_size", String(params?.page_size ?? 25));

  if (params?.category && params.category !== "all") {
    search.set("category", params.category);
  }

  if (params?.status && params.status !== "all") {
    search.set("status", params.status);
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

  return search.toString();
}

export const API_PROXY_PATHS = {
  // Auth/session helpers used by browser-side fetch wrappers.
  refresh: () => `${BACKEND_PROXY_ROOT}/auth/refresh`,

  // Stored content detail. Use this from browser-side fetch helpers when
  // requests should flow through the existing Next.js backend proxy.
  contentDetail: (
    contentType: "news" | "recall",
    contentId: string | number,
  ) =>
    `${BACKEND_PROXY_ROOT}/content-detail/item/${encodeURIComponent(
      contentType,
    )}/${encodeURIComponent(String(contentId))}`,

  newsDetail: (articleId: string | number) =>
    `${BACKEND_PROXY_ROOT}/content-detail/item/news/${encodeURIComponent(
      String(articleId),
    )}`,

  recallDetail: (recallId: string | number) =>
    `${BACKEND_PROXY_ROOT}/content-detail/item/recall/${encodeURIComponent(
      String(recallId),
    )}`,

  // Feedback.
  feedback: () => `${BACKEND_PROXY_ROOT}/feedback`,

  myFeedback: () => `${BACKEND_PROXY_ROOT}/feedback/me`,

  feedbackItem: (feedbackId: string | number) =>
    `${BACKEND_PROXY_ROOT}/feedback/${encodeURIComponent(String(feedbackId))}`,

  adminFeedback: (params?: AdminFeedbackParams) => {
    const qs = buildAdminFeedbackQuery(params);

    return `${BACKEND_PROXY_ROOT}/admin/feedback${qs ? `?${qs}` : ""}`;
  },

  adminFeedbackItem: (feedbackId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/feedback/${encodeURIComponent(String(feedbackId))}`,

  adminFeedbackStatus: (feedbackId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/feedback/${encodeURIComponent(String(feedbackId))}/status`,

  // Existing admin user proxy helpers.
  adminUsers: () => `${BACKEND_PROXY_ROOT}/admin/users`,
  adminAssignUserRole: () => `${BACKEND_PROXY_ROOT}/admin/users/assign-role`,
  adminSuspendUser: () => `${BACKEND_PROXY_ROOT}/admin/users/suspend`,
  adminUnsuspendUser: () => `${BACKEND_PROXY_ROOT}/admin/users/unsuspend`,

  // Existing admin drug-detail proxy helpers.
  adminDrugDetails: () => `${BACKEND_PROXY_ROOT}/admin/drug-details`,

  adminDrugDetail: (detailId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/drug-details/${encodeURIComponent(String(detailId))}`,

  adminDrugDetailResync: (detailId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/drug-details/${encodeURIComponent(String(detailId))}/resync`,

  adminDrugDetailCuratedFields: (detailId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/drug-details/${encodeURIComponent(String(detailId))}/curated-fields`,

  adminDrugDetailSafetyWarnings: (detailId: string | number) =>
    `${BACKEND_PROXY_ROOT}/admin/drug-details/${encodeURIComponent(String(detailId))}/safety-warnings`,

  // Next app proxy/API routes that are still local to Next rather than the catch-all backend proxy.
  usageLimitStatus: (featureKey: string) =>
    `/api/usage-limits/status?feature_key=${encodeURIComponent(featureKey)}`,

  usageLimitStatusAll: () => "/api/usage-limits/status/all",

  pdfDrugDetails: (detailId: string | number) =>
    `/api/drug-details/${encodeURIComponent(String(detailId))}/pdf`,
};