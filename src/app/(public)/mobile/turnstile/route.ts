// app/mobile/turnstile/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

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

const ACTIONS =
  new Set<TurnstileAction>([
    "register",
    "login",
    "forgot_password",
    "resend_verification",
  ]);

const THEMES =
  new Set<TurnstileTheme>([
    "auto",
    "light",
    "dark",
  ]);

const SIZES =
  new Set<TurnstileSize>([
    "normal",
    "compact",
    "flexible",
  ]);

export async function GET(
  request: NextRequest
) {
  const siteKey =
    process.env
      .NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return new NextResponse(
      "Turnstile site key is not configured.",
      {
        status: 500,
      }
    );
  }

  const searchParams =
    request.nextUrl.searchParams;

  const rawAction =
    searchParams.get(
      "action"
    );

  const rawTheme =
    searchParams.get(
      "theme"
    );

  const rawSize =
    searchParams.get(
      "size"
    );

  if (
    !rawAction ||
    !ACTIONS.has(
      rawAction as TurnstileAction
    )
  ) {
    return new NextResponse(
      "Invalid Turnstile action.",
      {
        status: 400,
      }
    );
  }

  const action =
    rawAction as TurnstileAction;

  const theme:
    TurnstileTheme =
      rawTheme &&
      THEMES.has(
        rawTheme as TurnstileTheme
      )
        ? (
            rawTheme as TurnstileTheme
          )
        : "auto";

  const size:
    TurnstileSize =
      rawSize &&
      SIZES.has(
        rawSize as TurnstileSize
      )
        ? (
            rawSize as TurnstileSize
          )
        : "flexible";

  /*
   * JSON.stringify safely produces
   * JavaScript string literals for
   * these already-validated values.
   */
  const siteKeyJson =
    JSON.stringify(siteKey);

  const actionJson =
    JSON.stringify(action);

  const themeJson =
    JSON.stringify(theme);

  const sizeJson =
    JSON.stringify(size);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <style>
    html,
    body {
      margin: 0;
      padding: 0;

      width: 100%;

      background: transparent;

      overflow: hidden;
    }

    body {
      display: flex;

      justify-content: center;
      align-items: flex-start;

      box-sizing: border-box;

      padding: 4px;
    }

    #turnstile-container {
      width: 100%;

      display: flex;

      justify-content: center;
      align-items: center;
    }
  </style>

  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  ></script>
</head>

<body>
  <div id="turnstile-container"></div>

  <script>
    const siteKey =
      ${siteKeyJson};

    const action =
      ${actionJson};

    const theme =
      ${themeJson};

    const size =
      ${sizeJson};

    function sendToNative(message) {
      if (
        window.ReactNativeWebView &&
        typeof window.ReactNativeWebView.postMessage === "function"
      ) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify(message)
        );
      }
    }

    function renderTurnstile() {
      if (
        !window.turnstile
      ) {
        sendToNative({
          type: "turnstile-error"
        });

        return;
      }

      try {
        window.turnstile.render(
          "#turnstile-container",
          {
            sitekey: siteKey,

            action: action,

            theme: theme,

            size: size,

            callback: function(token) {
              sendToNative({
                type:
                  "turnstile-success",

                token: token
              });
            },

            "expired-callback":
              function() {
                sendToNative({
                  type:
                    "turnstile-expired"
                });
              },

            "error-callback":
              function() {
                sendToNative({
                  type:
                    "turnstile-error"
                });
              },

            "timeout-callback":
              function() {
                sendToNative({
                  type:
                    "turnstile-timeout"
                });
              }
          }
        );
      } catch (error) {
        sendToNative({
          type:
            "turnstile-error"
        });
      }
    }

    /*
     * The Turnstile API script can
     * finish slightly after the page's
     * own script.
     */
    function waitForTurnstile() {
      if (
        window.turnstile
      ) {
        renderTurnstile();
        return;
      }

      setTimeout(
        waitForTurnstile,
        50
      );
    }

    waitForTurnstile();
  </script>
</body>
</html>
  `;

  return new NextResponse(
    html,
    {
      status: 200,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        /*
         * Avoid caching a security
         * challenge bridge.
         */
        "Cache-Control":
          "no-store",
      },
    }
  );
}