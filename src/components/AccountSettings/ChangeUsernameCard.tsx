"use client";

import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";

import {
  changeUsernameAction,
} from "@/app/actions/accountActions";

import {
  useAccountActionCooldown,
} from "./hooks/useAccountActionCooldown";
import {
  CooldownNotice,
  CurrentValueChip,
  Feedback,
  InputField,
  SectionCard,
  SubmitButton,
  UserIcon,
} from "./shared/AccountSettingsUI";
import { ChangeUsernameFormValues, FeedbackState } from "@/types/accountSettings";
import { getCooldownSecondsFromResult } from "@/lib/helpers/accountSettings";


export default function ChangeUsernameCard({
  currentUsername,
}: {
  currentUsername: string;
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
      "change_username",
    );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } =
    useForm<ChangeUsernameFormValues>(
      {
        defaultValues: {
          new_username:
            currentUsername,
        },
      },
    );

  async function onSubmit(
    values: ChangeUsernameFormValues,
  ) {
    if (cooldown.active) {
      setFeedback({
        ok: false,
        message:
          `Please wait ${cooldown.formatted} before changing your username again.`,
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result =
        await changeUsernameAction(
          values,
        );

      if (!result.ok) {
        const seconds =
          getCooldownSecondsFromResult(
            result,
          );

        if (seconds) {
          cooldown.start(seconds);
        }

        setFeedback({
          ok: false,
          message:
            result.error ??
            "Username could not be updated.",
        });

        return;
      }

      cooldown.start();

      setFeedback({
        ok: true,
        message:
          result.message ??
          "Username has been successfully updated.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Change Username"
      description="Usernames must be 4–20 characters with no spaces or special characters."
      icon={<UserIcon />}
      accentClass="bg-sky-500/60"
    >
      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-4"
      >
        <CurrentValueChip
          label="Current Username"
          value={currentUsername}
        />

        <InputField
          label="New Username"
          placeholder="Enter a new username"
          autoComplete="username"
          error={
            errors.new_username
              ?.message
          }
          {...register(
            "new_username",
            {
              required:
                "Username is required",
              minLength: {
                value: 4,
                message:
                  "Must be at least 4 characters",
              },
              maxLength: {
                value: 20,
                message:
                  "Must be 20 characters or fewer",
              },
            },
          )}
        />

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
            Update Username
          </SubmitButton>
        </div>
      </form>
    </SectionCard>
  );
}
