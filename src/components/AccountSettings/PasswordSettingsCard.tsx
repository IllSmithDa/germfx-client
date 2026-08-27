"use client";

import ChangePasswordForm from "./ChangePasswordForm";
import type {
  AccountSettingsAuth,
} from "./hooks/useAccountSettingsAuth";
import {
  Feedback,
  LoadingSecurityOptions,
  LockIcon,
  SectionCard,
} from "./shared/AccountSettingsUI";

export default function PasswordSettingsCard({
  auth,
}: {
  auth: AccountSettingsAuth;
}) {
  const isSetPassword =
    auth.capabilitiesReady &&
    !auth.hasPassword &&
    auth.hasGoogle;

  return (
    <SectionCard
      title={
        isSetPassword
          ? "Set Password"
          : "Change Password"
      }
      description={
        isSetPassword
          ? "Add a GermFx password to your Google-authenticated account. You will verify with Google before continuing to a dedicated password setup page."
          : "Choose a password between 8 and 128 characters. You will be signed out after changing it."
      }
      icon={<LockIcon />}
      accentClass="bg-rose-500/50"
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
      ) : auth.hasPassword ||
        auth.hasGoogle ? (
        <ChangePasswordForm
          auth={auth}
        />
      ) : (
        <Feedback
          state={{
            ok: false,
            message:
              "No supported authentication method is available for password management.",
          }}
        />
      )}
    </SectionCard>
  );
}