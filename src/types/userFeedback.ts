export type FeedbackCategory =
  | "general"
  | "bug"
  | "feature_request"
  | "drug_data"
  | "account"
  | "reports"
  | "ui_ux"
  | "performance"
  | "other";

export type FeedbackStatus = "unread" | "read" | "addressed";

export type FeedbackSort =
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "rating_desc"
  | "rating_asc";

export type UserFeedbackOut = {
  id: number;
  user_id?: number;
  category: FeedbackCategory | string;
  rating?: number | null;
  message: string;
  page_url?: string | null;
  user_agent?: string | null;
  status?: FeedbackStatus | string;
  created_at: string;
  updated_at: string;
};

export type AdminFeedbackOut = UserFeedbackOut & {
  user_id: number;
  username?: string | null;
  user_agent?: string | null;
};

export type AdminFeedbackListOut = {
  items: AdminFeedbackOut[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type SubmitFeedbackPayload = {
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
  page_url?: string | null;
};

export type UpdateFeedbackPayload = Partial<SubmitFeedbackPayload> & {
  feedbackId: number;
};

export type AdminFeedbackListParams = {
  page?: number;
  page_size?: number;
  category?: FeedbackCategory | "all";
  status?: FeedbackStatus | "all";
  rating?: number | "all";
  query?: string;
  sort?: FeedbackSort;
  user_id?: number | string;
};

export type AdminFeedbackStatusUpdatePayload = {
  feedbackId: number;
  status: FeedbackStatus;
};

export type AdminFeedbackParams = {
  page?: number;
  page_size?: number;
  category?: FeedbackCategory | "all";
  status?: FeedbackStatus | "all";
  rating?: number | "all";
  query?: string;
  user_id?: number | string;
  sort?: FeedbackSort;
};
