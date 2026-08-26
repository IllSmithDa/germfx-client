"use client";

import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  changePasswordClient,
} from "@/lib/client/accountsClientApi";

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
  VerificationChooser,
} from "./shared/AccountSettingsUI";
import { ChangePasswordFormValues, FeedbackState } from "@/types/accountSettings";
import { getCooldownSecondsFromResult } from "@/lib/helpers/accountSettings";

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
        <GoogleVerificationPrompt
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
