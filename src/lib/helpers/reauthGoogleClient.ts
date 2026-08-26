"use client";

import {
  API_PROXY_PATHS,
} from "@/config/paths";

export function startGoogleReauthentication(
  returnTo?: string,
) {
  const fallbackReturnTo =
    `${window.location.pathname}` +
    `${window.location.search}` +
    `${window.location.hash}`;

  const target =
    returnTo?.trim() ||
    fallbackReturnTo ||
    "/";

  window.location.assign(
    API_PROXY_PATHS.googleReauth(
      target,
    ),
  );
}
