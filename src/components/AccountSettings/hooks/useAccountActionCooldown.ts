"use client";

import { formatCooldownTime } from "@/lib/helpers/accountSettings";
import {
  useEffect,
  useState,
} from "react";


export type AccountCooldownAction =
  | "change_username"
  | "change_email"
  | "change_password";

const ACCOUNT_COOLDOWN_SECONDS: Record<
  AccountCooldownAction,
  number
> = {
  change_username: 300,
  change_email: 300,
  change_password: 300,
};

const ACCOUNT_COOLDOWN_LABELS: Record<
  AccountCooldownAction,
  string
> = {
  change_username:
    "username changes",
  change_email:
    "email-change requests",
  change_password:
    "password changes",
};

function getCooldownStorageKey(
  action: AccountCooldownAction,
) {
  return `sidefx_account_settings_cooldown_${action}`;
}

function getSecondsRemaining(
  cooldownUntil: number,
) {
  if (!cooldownUntil) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(
      (cooldownUntil - Date.now()) /
        1000,
    ),
  );
}

export function useAccountActionCooldown(
  action: AccountCooldownAction,
) {
  const defaultSeconds =
    ACCOUNT_COOLDOWN_SECONDS[action];
  const storageKey =
    getCooldownStorageKey(action);

  const [
    cooldownUntil,
    setCooldownUntil,
  ] = useState(0);
  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(0);

  useEffect(() => {
    const rawValue =
      window.localStorage.getItem(
        storageKey,
      );
    const parsedValue =
      Number(rawValue);

    if (
      !Number.isFinite(parsedValue) ||
      parsedValue <= Date.now()
    ) {
      window.localStorage.removeItem(
        storageKey,
      );
      return;
    }

    setCooldownUntil(parsedValue);
    setSecondsRemaining(
      getSecondsRemaining(parsedValue),
    );
  }, [storageKey]);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const updateRemainingTime = () => {
      const next =
        getSecondsRemaining(
          cooldownUntil,
        );

      setSecondsRemaining(next);

      if (next <= 0) {
        window.localStorage.removeItem(
          storageKey,
        );
        setCooldownUntil(0);
      }
    };

    updateRemainingTime();

    const intervalId =
      window.setInterval(
        updateRemainingTime,
        1000,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    cooldownUntil,
    storageKey,
  ]);

  function start(
    seconds = defaultSeconds,
  ) {
    const safeSeconds = Math.max(
      1,
      Math.ceil(seconds),
    );

    const nextCooldownUntil =
      Date.now() +
      safeSeconds * 1000;

    window.localStorage.setItem(
      storageKey,
      String(nextCooldownUntil),
    );
    setCooldownUntil(
      nextCooldownUntil,
    );
    setSecondsRemaining(
      safeSeconds,
    );
  }

  return {
    active:
      secondsRemaining > 0,
    secondsRemaining,
    start,
    label:
      ACCOUNT_COOLDOWN_LABELS[
        action
      ],
    formatted:
      formatCooldownTime(
        secondsRemaining,
      ),
  };
}
