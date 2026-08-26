"use client";

import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";


import type {
  AccountSettingsAuth,
} from "./hooks/useAccountSettingsAuth";
import {
  useAccountActionCooldown,
} from "./hooks/useAccountActionCooldown";
import {
  CooldownNotice,
  Feedback,
  GoogleVerificationPrompt,
  GoogleVerifiedNotice,
  PasswordField,
  SubmitButton,
} from "./shared/AccountSettingsUI";
import { FeedbackState, SetPasswordFormValues } from "@/types/accountSettings";
import { setPasswordClient } from "@/lib/server/accountSettingsApi";
import { getCooldownSecondsFromResult } from "@/lib/helpers/accountSettings";


export default function SetPasswordForm({
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
    useForm<SetPasswordFormValues>(
      {
        defaultValues: {
          new_password: "",
          confirm_new_password: "",
        },
      },
    );

  const combinedFeedback =
    feedback ??
    auth.passwordOAuthFeedback;

  async function onSubmit(
    values: SetPasswordFormValues,
  ) {
    if (cooldown.active) {
      setFeedback({
        ok: false,
        message:
          `Please wait ${cooldown.formatted} before setting a password.`,
      });
      return;
    }

    if (
      !auth.passwordGoogleVerified
    ) {
      setFeedback({
        ok: false,
        message:
          "Verify your Google account before setting a GermFx password.",
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result =
        await setPasswordClient(
          values,
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

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit,
      )}
      className="space-y-4"
    >
      {!auth.passwordGoogleVerified ? (
        <GoogleVerificationPrompt
          onVerify={
            auth.beginPasswordGoogleReauth
          }
          description="Verify the Google account linked to this GermFx account before adding your first GermFx password."
        />
      ) : (
        <>
          <GoogleVerifiedNotice />

          <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
            Adding a GermFx password
            does not remove Google
            sign-in. Afterward, you can
            use either method.
          </div>

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
        </>
      )}

      <Feedback
        state={combinedFeedback}
      />

      <CooldownNotice
        secondsRemaining={
          cooldown.secondsRemaining
        }
        label={cooldown.label}
      />

      {auth.passwordGoogleVerified ? (
        <div className="flex justify-end pt-1">
          <SubmitButton
            pending={pending}
            disabled={
              cooldown.active
            }
            disabledLabel={`Try again in ${cooldown.formatted}`}
          >
            Set Password
          </SubmitButton>
        </div>
      ) : null}
    </form>
  );
}
