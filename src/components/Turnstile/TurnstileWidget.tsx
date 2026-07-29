"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileAction =
  | "register"
  | "login"
  | "forgot_password"
  | "resend_verification";

type Props = {
  action: TurnstileAction;
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "compact" | "flexible";
  className?: string;
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";

export default function TurnstileWidget({
  action,
  onTokenChange,
  resetKey = 0,
  theme = "auto",
  size = "normal",
  className = "",
}: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (window.turnstile) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) {
      return;
    }

    if (widgetIdRef.current) {
      return;
    }

    const widgetId = window.turnstile?.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme,
      size,
      callback(token) {
        onTokenChangeRef.current(token);
      },
      "expired-callback"() {
        onTokenChangeRef.current(null);
      },
      "error-callback"() {
        onTokenChangeRef.current(null);
      },
      "timeout-callback"() {
        onTokenChangeRef.current(null);
      },
    });

    if (widgetId) {
      widgetIdRef.current = widgetId;
    }

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
      onTokenChangeRef.current(null);
    };
  }, [siteKey, scriptReady, action, theme, size]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    onTokenChangeRef.current(null);
  }, [resetKey]);

  if (!siteKey) {
    return process.env.NODE_ENV === "development" ? (
      <p className="text-sm text-red-500">
        Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY.
      </p>
    ) : null;
  }

  return (
    <>
      <Script
        id={TURNSTILE_SCRIPT_ID}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div className={className}>
        <div ref={containerRef} />
      </div>
    </>
  );
}