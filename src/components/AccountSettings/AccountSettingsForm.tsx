"use client";

import ChangeEmailCard from "./ChangeEmailCard";
import PasswordSettingsCard from "./PasswordSettingsCard";
import ChangeUsernameCard from "./ChangeUsernameCard";
import {
  useAccountSettingsAuth,
} from "./hooks/useAccountSettingsAuth";

type AccountSettingsFormsProps = {
  currentUsername: string;
  currentEmail: string;
};

export default function AccountSettingsForms({
  currentUsername,
  currentEmail,
}: AccountSettingsFormsProps) {
  const auth =
    useAccountSettingsAuth();

  return (
    <div className="grid gap-5">
      <ChangeUsernameCard
        currentUsername={
          currentUsername
        }
      />

      <ChangeEmailCard
        currentEmail={currentEmail}
        auth={auth}
      />

      <PasswordSettingsCard
        auth={auth}
      />
    </div>
  );
}
