

import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  changePasswordClient,
} from "@/lib/client/accountsClientApi";
import {
  startGoogleReauthentication,
} from "@/lib/helpers/reauthGoogleClient";

import type {
  AccountSettingsAuth,
} from "./hooks/useAccountSettingsAuth";
import {
  useAccountActionCooldown,
} from "./hooks/useAccountActionCooldown";
import {
  CooldownNotice,
  Feedback,
  GoogleVerifiedNotice,
  PasswordField,
  SubmitButton,
  VerificationChooser,
} from "./shared/AccountSettingsUI";
import { ChangePasswordFormValues, FeedbackState } from "@/types/accountSettings";
import { getCooldownSecondsFromResult } from "@/lib/helpers/accountSettings";

function CompactGoogleVerificationPrompt({
  onVerify,
  description,
}: {
  onVerify: () => void;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
        {description}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onVerify}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:text-sky-300"
        >
          Verify with Google
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm({
  auth,
}: {
  auth: AccountSettingsAuth;
}) {
  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>(null);
  const [
    pending,
    setPending,
  ] = useState(false);

  const cooldown =
    useAccountActionCooldown(
      "change_password",
    );

  const form =
    useForm<ChangePasswordFormValues>(
      {
        defaultValues: {
          current_password: "",
          new_password: "",
          confirm_new_password: "",
        },
      },
    );

  const combinedFeedback =
    feedback ??
    auth.passwordOAuthFeedback;

  function choosePassword() {
    auth.setPasswordVerificationMethod(
      "password",
    );
    auth.setPasswordGoogleVerified(
      false,
    );
    auth.setPasswordOAuthFeedback(
      null,
    );
    setFeedback(null);
    form.reset();
  }

  function chooseGoogle() {
    auth.setPasswordVerificationMethod(
      "google",
    );
    auth.setPasswordOAuthFeedback(
      null,
    );
    setFeedback(null);
    form.reset();
  }

  function beginGoogleSetPassword() {
    setFeedback(null);
    auth.setPasswordOAuthFeedback(
      null,
    );

    startGoogleReauthentication(
      "/account/set-password",
    );
  }

  async function onSubmit(
    values: ChangePasswordFormValues,
  ) {
    if (cooldown.active) {
      setFeedback({
        ok: false,
        message:
          `Please wait ${cooldown.formatted} before changing your password again.`,
      });
      return;
    }

    if (
      auth.passwordVerificationMethod ===
        "google" &&
      !auth.passwordGoogleVerified
    ) {
      setFeedback({
        ok: false,
        message:
          "Verify your Google account before changing your password.",
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const payload = {
        new_password:
          values.new_password,
        confirm_new_password:
          values.confirm_new_password,
        ...(auth.passwordVerificationMethod ===
        "password"
          ? {
              current_password:
                values.current_password,
            }
          : {}),
      } as Parameters<
        typeof changePasswordClient
      >[0];

      const result =
        await changePasswordClient(
          payload,
        );

      const seconds =
        getCooldownSecondsFromResult(
          result,
        );

      if (
        !result.ok &&
        seconds
      ) {
        cooldown.start(seconds);
      }

      setFeedback({
        ok: result.ok,
        message: result.message,
      });

      if (result.ok) {
        cooldown.start();
        form.reset();

        setTimeout(() => {
          window.location.href =
            "/login";
        }, 1500);
      }
    } finally {
      setPending(false);
    }
  }

  /*
   * A Google-only account does not have an existing GermFx password to
   * change. Password creation is intentionally moved to the focused
   * /account/set-password flow after fresh Google verification.
   *
   * Existing password accounts and dual-auth accounts continue through the
   * normal Change Password form below.
   */
  if (
    auth.capabilitiesReady &&
    !auth.hasPassword &&
    auth.hasGoogle
  ) {
    return (
      <div className="space-y-4">
        <CompactGoogleVerificationPrompt
          onVerify={
            beginGoogleSetPassword
          }
          description="Verify the Google account linked to this GermFx account. After verification, you will continue on a dedicated page to create your GermFx password."
        />

        <Feedback
          state={
            auth.passwordOAuthFeedback
          }
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit,
      )}
      className="space-y-4"
    >
      {auth.dualAuth ? (
        <VerificationChooser
          value={
            auth.passwordVerificationMethod
          }
          onPassword={
            choosePassword
          }
          onGoogle={
            chooseGoogle
          }
        />
      ) : null}

      {auth.dualAuth &&
      auth.passwordVerificationMethod !==
        null &&
      !auth.passwordGoogleVerified ? (
        <button
          type="button"
          onClick={() => {
            auth.setPasswordVerificationMethod(
              null,
            );
            auth.setPasswordGoogleVerified(
              false,
            );
            auth.setPasswordOAuthFeedback(
              null,
            );
            setFeedback(null);
            form.reset();
          }}
          className="text-sm font-medium text-sky-700 underline underline-offset-2 hover:opacity-80 dark:text-sky-300"
        >
          Use a different verification
          method
        </button>
      ) : null}

      {auth.passwordVerificationMethod ===
        "password" ? (
        <PasswordField
          label="Current Password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          error={
            form.formState.errors
              .current_password
              ?.message
          }
          {...form.register(
            "current_password",
            {
              required:
                "Current password is required",
            },
          )}
        />
      ) : null}

      {auth.passwordVerificationMethod ===
        "google" &&
      !auth.passwordGoogleVerified ? (
        <CompactGoogleVerificationPrompt
          onVerify={
            auth.beginPasswordGoogleReauth
          }
          description="Verify the Google account linked to this GermFx account before changing your GermFx password."
        />
      ) : null}

      {auth.passwordVerificationMethod ===
        "google" &&
      auth.passwordGoogleVerified ? (
        <GoogleVerifiedNotice />
      ) : null}

      {auth.passwordVerificationMethod ===
        "password" ||
      auth.passwordGoogleVerified ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="New Password"
            autoComplete="new-password"
            placeholder="New password"
            error={
              form.formState.errors
                .new_password
                ?.message
            }
            {...form.register(
              "new_password",
              {
                required:
                  "New password is required",
                minLength: {
                  value: 8,
                  message:
                    "Must be at least 8 characters",
                },
                maxLength: {
                  value: 128,
                  message:
                    "Must be 128 characters or fewer",
                },
              },
            )}
          />

          <PasswordField
            label="Confirm New Password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            error={
              form.formState.errors
                .confirm_new_password
                ?.message
            }
            {...form.register(
              "confirm_new_password",
              {
                required:
                  "Please confirm your new password",
                validate: (
                  value,
                ) =>
                  value ===
                    form.watch(
                      "new_password",
                    ) ||
                  "Passwords do not match",
              },
            )}
          />
        </div>
      ) : null}

      <Feedback
        state={combinedFeedback}
      />

      <CooldownNotice
        secondsRemaining={
          cooldown.secondsRemaining
        }
        label={cooldown.label}
      />

      {auth.passwordVerificationMethod ===
        "password" ||
      auth.passwordGoogleVerified ? (
        <div className="flex justify-end pt-1">
          <SubmitButton
            pending={pending}
            disabled={
              cooldown.active
            }
            disabledLabel={`Try again in ${cooldown.formatted}`}
          >
            Update Password
          </SubmitButton>
        </div>
      ) : null}
    </form>
  );
}