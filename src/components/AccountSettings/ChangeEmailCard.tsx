"use client";

import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  changeEmailClient,
} from "@/lib/client/accountsClientApi";

import type {
  AccountSettingsAuth,
} from "./hooks/useAccountSettingsAuth";
import {
  useAccountActionCooldown,
} from "./hooks/useAccountActionCooldown";
import {
  CooldownNotice,
  CurrentValueChip,
  Feedback,
  InputField,
  LoadingSecurityOptions,
  MailIcon,
  PasswordField,
  SectionCard,
  SubmitButton,
} from "./shared/AccountSettingsUI";
import {
  ChangeEmailFormValues,
  FeedbackState,
} from "@/types/accountSettings";
import {
  getCooldownSecondsFromResult,
} from "@/lib/helpers/accountSettings";

export default function ChangeEmailCard({
  currentEmail,
  auth,
}: {
  currentEmail: string;
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
      "change_email",
    );

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors },
  } =
    useForm<ChangeEmailFormValues>(
      {
        defaultValues: {
          current_password: "",
          new_email: currentEmail,
          confirm_new_email:
            currentEmail,
        },
      },
    );

  async function onSubmit(
    values: ChangeEmailFormValues,
  ) {
    if (cooldown.active) {
      setFeedback({
        ok: false,
        message:
          `Please wait ${cooldown.formatted} before requesting another email change.`,
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result =
        await changeEmailClient({
          current_password:
            values.current_password ?? '',
          new_email:
            values.new_email,
          confirm_new_email:
            values.confirm_new_email,
        });

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
        message:
          result.message ||
          (result.ok
            ? "Verification email sent. Please check your new email address to complete the change."
            : "Unable to request email change."),
      });

      if (result.ok) {
        cooldown.start();

        resetField(
          "current_password",
        );
      }
    } finally {
      setPending(false);
    }
  }

  /*
   * Email changes are intentionally unavailable to OAuth-only accounts
   * for now. A dual-auth account remains eligible because it has a GermFx
   * password and must use that password for this action.
   */
  if (
    auth.capabilitiesReady &&
    !auth.hasPassword
  ) {
    return null;
  }

  return (
    <SectionCard
      title="Change Email"
      description="Requires your current GermFx password. A verification link will be sent to your new email address."
      icon={<MailIcon />}
      accentClass="bg-violet-500/60"
    >
      {!auth.capabilitiesReady &&
      !auth.capabilitiesError ? (
        <LoadingSecurityOptions />
      ) : auth.capabilitiesError ? (
        <Feedback
          state={{
            ok: false,
            message:
              auth.capabilitiesError,
          }}
        />
      ) : (
        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}
          className="space-y-4"
        >
          <CurrentValueChip
            label="Current Email"
            value={currentEmail}
          />

          <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
            Your email will not change
            immediately. We will send a
            verification link to your new
            email address. After you
            confirm it, your GermFx email
            will be updated and existing
            sessions may be signed out for
            security.
          </div>

          <PasswordField
            label="Current Password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            error={
              errors.current_password
                ?.message
            }
            {...register(
              "current_password",
              {
                required:
                  "Current password is required",
              },
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="New Email"
              type="email"
              autoComplete="email"
              placeholder="New email address"
              error={
                errors.new_email
                  ?.message
              }
              {...register(
                "new_email",
                {
                  required:
                    "New email is required",
                },
              )}
            />

            <InputField
              label="Confirm New Email"
              type="email"
              autoComplete="email"
              placeholder="Confirm new email"
              error={
                errors
                  .confirm_new_email
                  ?.message
              }
              {...register(
                "confirm_new_email",
                {
                  required:
                    "Please confirm your new email",
                  validate: (
                    value,
                  ) =>
                    value ===
                      watch(
                        "new_email",
                      ) ||
                    "Emails do not match",
                },
              )}
            />
          </div>

          <Feedback
            state={feedback}
          />

          <CooldownNotice
            secondsRemaining={
              cooldown.secondsRemaining
            }
            label={cooldown.label}
          />

          <div className="flex justify-end pt-1">
            <SubmitButton
              pending={pending}
              disabled={
                cooldown.active
              }
              disabledLabel={`Try again in ${cooldown.formatted}`}
            >
              Send Verification Email
            </SubmitButton>
          </div>
        </form>
      )}
    </SectionCard>
  );
}