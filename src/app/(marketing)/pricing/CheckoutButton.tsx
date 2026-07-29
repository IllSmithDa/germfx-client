"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BillingCheckoutButtonProps = {
  plan?: "plus";
  children: React.ReactNode;
  className?: string;
};

type BillingCheckoutResponse = {
  provider: string;
  plan: string;
  checkout_url: string;
};

const CHECKOUT_DISABLED_FOR_BETA = true;

export default function CheckoutButton({
  plan = "plus",
  children,
  className,
}: BillingCheckoutButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    if (CHECKOUT_DISABLED_FOR_BETA) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          provider: "paddle",
          plan,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push("/login?next=/pricing");
        return;
      }

      if (!response.ok) {
        const message =
          data?.detail?.message ||
          data?.detail ||
          "Unable to start checkout.";

        throw new Error(
          typeof message === "string" ? message : "Unable to start checkout.",
        );
      }

      const checkoutData = data as BillingCheckoutResponse;

      if (!checkoutData.checkout_url) {
        throw new Error("Checkout URL missing from billing response.");
      }

      window.location.assign(checkoutData.checkout_url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start checkout.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={CHECKOUT_DISABLED_FOR_BETA || isLoading}
        aria-disabled={CHECKOUT_DISABLED_FOR_BETA || isLoading}
        title={
          CHECKOUT_DISABLED_FOR_BETA
            ? "Checkout is currently disabled during beta testing."
            : undefined
        }
        className={className}
      >
        {isLoading ? "Opening checkout..." : children}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
      ) : null}
    </>
  );
}