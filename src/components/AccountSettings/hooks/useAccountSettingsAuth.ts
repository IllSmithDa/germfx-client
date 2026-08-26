"use client";

import {
  useEffect,
  useState,
} from "react";


import {
  startGoogleReauthentication,
} from "@/lib/helpers/reauthGoogleClient";
import { AccountAuthCapabilities, FeedbackState, SettingsGoogleAction, VerificationMethod } from "@/types/accountSettings";
import { buildSettingsReauthReturnTo, getGoogleReauthErrorMessage } from "@/lib/helpers/accountSettings";
import { API_PROXY_PATHS } from "@/config/paths";


export function useAccountSettingsAuth() {
  const [
    capabilities,
    setCapabilities,
  ] =
    useState<AccountAuthCapabilities | null>(
      null,
    );

  const [
    capabilitiesError,
    setCapabilitiesError,
  ] = useState<string | null>(null);

  const [
    emailVerificationMethod,
    setEmailVerificationMethod,
  ] =
    useState<VerificationMethod>(
      null,
    );

  const [
    passwordVerificationMethod,
    setPasswordVerificationMethod,
  ] =
    useState<VerificationMethod>(
      null,
    );

  const [
    emailGoogleVerified,
    setEmailGoogleVerified,
  ] = useState(false);

  const [
    passwordGoogleVerified,
    setPasswordGoogleVerified,
  ] = useState(false);

  const [
    emailOAuthFeedback,
    setEmailOAuthFeedback,
  ] =
    useState<FeedbackState>(null);

  const [
    passwordOAuthFeedback,
    setPasswordOAuthFeedback,
  ] =
    useState<FeedbackState>(null);

  const capabilitiesReady =
    capabilities !== null;

  const hasPassword =
    capabilities?.has_password ??
    false;

  const hasGoogle =
    capabilities?.oauth_providers.includes(
      "google",
    ) ?? false;

  const dualAuth =
    hasPassword && hasGoogle;

  useEffect(() => {
    let cancelled = false;

    async function loadCapabilities() {
      try {
        const response = await fetch(
          API_PROXY_PATHS.me(),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error();
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        const nextCapabilities: AccountAuthCapabilities =
          {
            has_password:
              data?.has_password === true,
            oauth_providers:
              Array.isArray(
                data?.oauth_providers,
              )
                ? data.oauth_providers
                    .filter(
                      (
                        provider: unknown,
                      ) =>
                        typeof provider ===
                        "string",
                    )
                    .map(
                      (
                        provider: string,
                      ) =>
                        provider.toLowerCase(),
                    )
                : [],
          };

        setCapabilities(
          nextCapabilities,
        );

        const nextHasPassword =
          nextCapabilities.has_password;
        const nextHasGoogle =
          nextCapabilities.oauth_providers.includes(
            "google",
          );

        if (
          nextHasPassword &&
          !nextHasGoogle
        ) {
          setEmailVerificationMethod(
            "password",
          );
          setPasswordVerificationMethod(
            "password",
          );
        } else if (
          !nextHasPassword &&
          nextHasGoogle
        ) {
          setEmailVerificationMethod(
            "google",
          );
          setPasswordVerificationMethod(
            "google",
          );
        }
      } catch {
        if (!cancelled) {
          setCapabilitiesError(
            "Unable to determine your account authentication methods. Refresh the page and try again.",
          );
        }
      }
    }

    void loadCapabilities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!capabilitiesReady) {
      return;
    }

    const url = new URL(
      window.location.href,
    );

    const action =
      url.searchParams.get(
        "settings_action",
      ) as SettingsGoogleAction | null;

    const success =
      url.searchParams.get("reauth") ===
      "success";

    const error =
      url.searchParams.get(
        "reauth_error",
      );

    if (
      action === "change_email" &&
      (success || error)
    ) {
      setEmailVerificationMethod(
        "google",
      );

      if (success) {
        setEmailGoogleVerified(true);
        setEmailOAuthFeedback(null);
      } else if (error) {
        setEmailGoogleVerified(false);
        setEmailOAuthFeedback({
          ok: false,
          message:
            getGoogleReauthErrorMessage(
              error,
            ),
        });
      }
    }

    if (
      action === "password" &&
      (success || error)
    ) {
      setPasswordVerificationMethod(
        "google",
      );

      if (success) {
        setPasswordGoogleVerified(
          true,
        );
        setPasswordOAuthFeedback(null);
      } else if (error) {
        setPasswordGoogleVerified(
          false,
        );
        setPasswordOAuthFeedback({
          ok: false,
          message:
            getGoogleReauthErrorMessage(
              error,
            ),
        });
      }
    }

    if (success || error) {
      url.searchParams.delete(
        "settings_action",
      );
      url.searchParams.delete("reauth");
      url.searchParams.delete(
        "reauth_error",
      );

      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  }, [capabilitiesReady]);

  function beginGoogleReauth(
    action: SettingsGoogleAction,
  ) {
    startGoogleReauthentication(
      buildSettingsReauthReturnTo(
        action,
      ),
    );
  }

  return {
    capabilitiesReady,
    capabilitiesError,
    hasPassword,
    hasGoogle,
    dualAuth,

    emailVerificationMethod,
    setEmailVerificationMethod,
    emailGoogleVerified,
    setEmailGoogleVerified,
    emailOAuthFeedback,
    setEmailOAuthFeedback,

    passwordVerificationMethod,
    setPasswordVerificationMethod,
    passwordGoogleVerified,
    setPasswordGoogleVerified,
    passwordOAuthFeedback,
    setPasswordOAuthFeedback,

    beginEmailGoogleReauth: () =>
      beginGoogleReauth(
        "change_email",
      ),

    beginPasswordGoogleReauth: () =>
      beginGoogleReauth(
        "password",
      ),
  };
}

export type AccountSettingsAuth =
  ReturnType<
    typeof useAccountSettingsAuth
  >;
