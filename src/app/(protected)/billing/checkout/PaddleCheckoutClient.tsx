"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type PaddleEnvironment = "sandbox" | "production";

type PaddleCheckoutSettings = {
  displayMode?: "overlay" | "inline";
  theme?: "light" | "dark";
  locale?: string;
  successUrl?: string;
};

type PaddleEvent = {
  name?: string;
  data?: {
    transaction_id?: string;
    subscription_id?: string;
  };
};

type PaddleInstance = {
  Environment?: {
    set: (environment: "sandbox") => void;
  };
  Initialize: (options: {
    token: string;
    eventCallback?: (event: PaddleEvent) => void;
    checkout?: {
      settings?: PaddleCheckoutSettings;
    };
  }) => void;
  Checkout: {
    open: (options: {
      transactionId: string;
      settings?: PaddleCheckoutSettings;
    }) => void;
    close?: () => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

export default function PaddleCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("_ptxn");
  const openedCheckoutRef = useRef(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Preparing checkout...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  const paddleEnvironment = useMemo<PaddleEnvironment>(() => {
    return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";
  }, []);

  useEffect(() => {
    if (!scriptLoaded || openedCheckoutRef.current) {
      return;
    }

    if (!transactionId) {
      setErrorMessage("Missing Paddle transaction id.");
      setStatusMessage("Checkout could not be opened.");
      return;
    }

    if (!clientToken) {
      setErrorMessage(
        "Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in your Next.js environment.",
      );
      setStatusMessage("Checkout could not be opened.");
      return;
    }

    const paddle = window.Paddle;

    if (!paddle) {
      setErrorMessage("Paddle.js did not load.");
      setStatusMessage("Checkout could not be opened.");
      return;
    }

    try {
      if (paddleEnvironment === "sandbox") {
        paddle.Environment?.set("sandbox");
      }

      const successUrl = new URL(
        `/billing/success?provider=paddle&transaction_id=${encodeURIComponent(
          transactionId,
        )}`,
        window.location.origin,
      ).toString();

      const checkoutSettings: PaddleCheckoutSettings = {
        displayMode: "overlay",
        theme: "light",
        locale: "en",
        successUrl,
      };

      paddle.Initialize({
        token: clientToken,
        checkout: {
          settings: checkoutSettings,
        },
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            const completedTransactionId =
              event.data?.transaction_id || transactionId;

            router.replace(
              `/billing/success?provider=paddle&transaction_id=${encodeURIComponent(
                completedTransactionId,
              )}`,
            );
          }

          if (event.name === "checkout.closed") {
            setStatusMessage("Checkout was closed.");
          }
        },
      });

      paddle.Checkout.open({
        transactionId,
        settings: checkoutSettings,
      });

      openedCheckoutRef.current = true;
      setStatusMessage("Checkout opened. Complete the Paddle checkout window.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to open checkout.",
      );
      setStatusMessage("Checkout could not be opened.");
    }
  }, [clientToken, paddleEnvironment, router, scriptLoaded, transactionId]);

  function retryCheckout() {
    openedCheckoutRef.current = false;
    setErrorMessage(null);
    setStatusMessage("Preparing checkout...");

    if (window.Paddle && transactionId) {
      setScriptLoaded(true);
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-6 py-16 text-[hsl(var(--foreground))]">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setErrorMessage("Unable to load Paddle.js.");
          setStatusMessage("Checkout could not be opened.");
        }}
      />

      <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-500">
            SideFX Plus
          </p>
          <h1 className="mt-2 text-3xl font-bold">Opening checkout</h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))]">
            {statusMessage}
          </p>
        </div>

        {transactionId ? (
          <p className="rounded-2xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            Transaction:{" "}
            <span className="font-mono text-[hsl(var(--foreground))]">
              {transactionId}
            </span>
          </p>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retryCheckout}
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Retry checkout
          </button>

          <Link
            href="/pricing"
            className="rounded-full border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold transition hover:bg-[hsl(var(--muted))]"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}