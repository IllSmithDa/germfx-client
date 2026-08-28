"use client";

import Script from "next/script";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type TurnstileAction =
  | "register"
  | "login"
  | "forgot_password"
  | "resend_verification";

type TurnstileTheme =
  | "auto"
  | "light"
  | "dark";

type TurnstileSize =
  | "normal"
  | "compact"
  | "flexible";

type BridgeConfig = {
  action: TurnstileAction;
  theme: TurnstileTheme;
  size: TurnstileSize;
};

type NativeMessage =
  | {
      type: "turnstile-success";
      token: string;
    }
  | {
      type: "turnstile-expired";
    }
  | {
      type: "turnstile-error";
    }
  | {
      type: "turnstile-timeout";
    }
  | {
      type: "turnstile-reset";
    }
  | {
      type: "turnstile-config-error";
      message: string;
    };

/*
 * IMPORTANT:
 *
 * Do NOT redeclare window.turnstile here.
 *
 * Your project already declares it in
 * turnstile.d.ts.
 *
 * We only need to add the React Native
 * WebView bridge property.
 */
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (
        message: string
      ) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID =
  "germfx-mobile-turnstile-script";

const ALLOWED_ACTIONS =
  new Set<TurnstileAction>([
    "register",
    "login",
    "forgot_password",
    "resend_verification",
  ]);

const ALLOWED_THEMES =
  new Set<TurnstileTheme>([
    "auto",
    "light",
    "dark",
  ]);

const ALLOWED_SIZES =
  new Set<TurnstileSize>([
    "normal",
    "compact",
    "flexible",
  ]);

function isTurnstileAction(
  value: string | null
): value is TurnstileAction {
  return (
    value !== null &&
    ALLOWED_ACTIONS.has(
      value as TurnstileAction
    )
  );
}

function isTurnstileTheme(
  value: string | null
): value is TurnstileTheme {
  return (
    value !== null &&
    ALLOWED_THEMES.has(
      value as TurnstileTheme
    )
  );
}

function isTurnstileSize(
  value: string | null
): value is TurnstileSize {
  return (
    value !== null &&
    ALLOWED_SIZES.has(
      value as TurnstileSize
    )
  );
}

function sendToNative(
  message: NativeMessage
) {
  /*
   * This exists when the page is
   * running inside react-native-webview.
   *
   * In a normal desktop browser it will
   * simply be undefined.
   */
  window.ReactNativeWebView?.postMessage(
    JSON.stringify(message)
  );
}

function readBridgeConfig():
  | {
      ok: true;
      config: BridgeConfig;
    }
  | {
      ok: false;
      message: string;
    } {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const rawAction =
    params.get("action");

  const rawTheme =
    params.get("theme");

  const rawSize =
    params.get("size");

  /*
   * Action is required because the
   * FastAPI backend verifies that the
   * token action matches the route.
   */
  if (
    !isTurnstileAction(
      rawAction
    )
  ) {
    return {
      ok: false,
      message:
        "Invalid or missing Turnstile action.",
    };
  }

  const theme:
    TurnstileTheme =
      isTurnstileTheme(
        rawTheme
      )
        ? rawTheme
        : "auto";

  const size:
    TurnstileSize =
      isTurnstileSize(
        rawSize
      )
        ? rawSize
        : "flexible";

  return {
    ok: true,

    config: {
      action:
        rawAction,

      theme,
      size,
    },
  };
}

export default function MobileTurnstilePage() {
  const siteKey =
    process.env
      .NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const widgetIdRef =
    useRef<string | null>(
      null
    );

  const [
    scriptReady,
    setScriptReady,
  ] = useState(false);

  const [
    config,
    setConfig,
  ] =
    useState<BridgeConfig | null>(
      null
    );

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(
    null
  );

  /*
   * Read URL parameters.
   */
  useEffect(() => {
    const result =
      readBridgeConfig();

    if (!result.ok) {
      setPageError(
        result.message
      );

      sendToNative({
        type:
          "turnstile-config-error",

        message:
          result.message,
      });

      return;
    }

    setConfig(
      result.config
    );
  }, []);

  /*
   * If the Cloudflare script already
   * exists because of Next.js client
   * navigation, mark it ready.
   */
  useEffect(() => {
    if (
      window.turnstile
    ) {
      setScriptReady(true);
    }
  }, []);

  const notifyReset =
    useCallback(() => {
      sendToNative({
        type:
          "turnstile-reset",
      });
    }, []);

  /*
   * Render the widget once:
   *
   * site key
   * + validated URL config
   * + Cloudflare script
   * + DOM container
   *
   * are all available.
   */
  useEffect(() => {
    if (
      !siteKey ||
      !config ||
      !scriptReady ||
      !containerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    if (
      widgetIdRef.current
    ) {
      return;
    }

    try {
      const widgetId =
        window.turnstile.render(
          containerRef.current,
          {
            sitekey:
              siteKey,

            action:
              config.action,

            theme:
              config.theme,

            size:
              config.size,

            callback(token) {
              sendToNative({
                type:
                  "turnstile-success",

                token,
              });
            },

            "expired-callback"() {
              sendToNative({
                type:
                  "turnstile-expired",
              });
            },

            /*
             * Your existing
             * turnstile.d.ts declares
             * this callback as () => void,
             * so don't accept an
             * errorCode parameter here.
             */
            "error-callback"() {
              sendToNative({
                type:
                  "turnstile-error",
              });
            },

            "timeout-callback"() {
              sendToNative({
                type:
                  "turnstile-timeout",
              });
            },
          }
        );

      if (widgetId) {
        widgetIdRef.current = widgetId;
      }
    } catch {
      const message =
        "Unable to initialize security verification.";

      setPageError(
        message
      );

      sendToNative({
        type:
          "turnstile-config-error",

        message,
      });
    }

    return () => {
      if (
        widgetIdRef.current &&
        window.turnstile?.remove
      ) {
        try {
          window.turnstile.remove(
            widgetIdRef.current
          );
        } catch {
          // Cleanup failure is
          // non-fatal.
        }
      }

      widgetIdRef.current =
        null;

      notifyReset();
    };
  }, [
    siteKey,
    config,
    scriptReady,
    notifyReset,
  ]);

  if (!siteKey) {
    return (
      <main
        style={
          styles.page
        }
      >
        <p
          style={
            styles.error
          }
        >
          Turnstile site key is
          not configured.
        </p>
      </main>
    );
  }

  if (pageError) {
    return (
      <main
        style={
          styles.page
        }
      >
        <p
          style={
            styles.error
          }
        >
          {pageError}
        </p>
      </main>
    );
  }

  return (
    <>
      <Script
        id={
          TURNSTILE_SCRIPT_ID
        }

        src={
          "https://challenges.cloudflare.com/" +
          "turnstile/v0/api.js?render=explicit"
        }

        strategy="afterInteractive"

        onLoad={() => {
          setScriptReady(true);
        }}

        onError={() => {
          const message =
            "Unable to load security verification.";

          setPageError(
            message
          );

          sendToNative({
            type:
              "turnstile-config-error",

            message,
          });
        }}
      />

      <main
        style={
          styles.page
        }
      >
        <div
          ref={
            containerRef
          }

          style={
            styles.widgetContainer
          }
        />
      </main>
    </>
  );
}

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    margin: 0,

    padding: "8px",

    minHeight: "100vh",

    display: "flex",

    alignItems:
      "flex-start",

    justifyContent:
      "center",

    overflow: "hidden",

    background:
      "transparent",
  },

  widgetContainer: {
    width: "100%",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",
  },

  error: {
    margin: 0,

    padding: "12px",

    color: "#f87171",

    fontSize: "13px",

    lineHeight: 1.4,

    textAlign: "center",
  },
};