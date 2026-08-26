export type AccountAuthCapabilities = {
  has_password: boolean;
  oauth_providers: string[];
};

export type VerificationMethod =
  | "password"
  | "google"
  | null;

export type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

export type ChangeUsernameFormValues = {
  new_username: string;
};

export type ChangeEmailFormValues = {
  current_password?: string;
  new_email: string;
  confirm_new_email: string;
};

export type ChangePasswordFormValues = {
  current_password?: string;
  new_password: string;
  confirm_new_password: string;
};

export type SetPasswordFormValues = {
  new_password: string;
  confirm_new_password: string;
};

export type ClientResult = {
  ok: boolean;
  message: string;
  code?: string | null;
  remaining_seconds?: number;
  retryAfterSeconds?: number;
  retry_after_seconds?: number;
};

export type SettingsGoogleAction =
  | "change_email"
  | "password";
