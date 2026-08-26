"use client";

import {
  API_PROXY_PATHS,
} from "@/config/paths";

export function startGoogleAccountReactivation() {
  window.location.assign(
    API_PROXY_PATHS.googleReactivate(),
  );
}
