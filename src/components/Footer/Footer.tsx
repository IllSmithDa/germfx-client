"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type LogoTheme = "light" | "dark";

const LOGO_LIGHT_SRC = "/logo/germfx-logo-light.png";
const LOGO_DARK_SRC = "/logo/germfx-logo.png";

function readExplicitThemeValue(): LogoTheme | null {
  if (typeof document === "undefined") {
    return null;
  }

  const candidates = [document.documentElement, document.body].filter(Boolean);

  for (const element of candidates) {
    const className = String(element.className || "").toLowerCase();

    if (/(^|\s)dark($|\s)/.test(className)) {
      return "dark";
    }

    if (/(^|\s)light($|\s)/.test(className)) {
      return "light";
    }

    const attrValues = [
      element.getAttribute("data-theme"),
      element.getAttribute("data-mode"),
      element.getAttribute("data-appearance"),
      element.getAttribute("data-color-scheme"),
    ];

    for (const value of attrValues) {
      const normalized = String(value || "").toLowerCase();

      if (normalized.includes("dark")) {
        return "dark";
      }

      if (normalized.includes("light")) {
        return "light";
      }
    }
  }

  return null;
}

function parseCssLightness(value: string): number | null {
  const numbers = value.match(/-?\d*\.?\d+%?/g);

  if (!numbers || numbers.length < 3) {
    return null;
  }

  const lightness = Number.parseFloat(numbers[2]);

  return Number.isFinite(lightness) ? lightness : null;
}

function resolveLogoTheme(): LogoTheme {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "dark";
  }

  const explicitTheme = readExplicitThemeValue();

  if (explicitTheme) {
    return explicitTheme;
  }

  const rootStyles = window.getComputedStyle(document.documentElement);
  const bodyStyles = window.getComputedStyle(document.body);
  const background =
    rootStyles.getPropertyValue("--background").trim() ||
    bodyStyles.getPropertyValue("--background").trim();

  const lightness = parseCssLightness(background);

  if (lightness != null) {
    return lightness >= 50 ? "light" : "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function SideFxFooterLogo() {
  const [logoTheme, setLogoTheme] = useState<LogoTheme>("dark");

  useEffect(() => {
    const updateLogoTheme = () => {
      setLogoTheme(resolveLogoTheme());
    };

    updateLogoTheme();

    const observer = new MutationObserver(updateLogoTheme);
    const observerOptions: MutationObserverInit = {
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "data-theme",
        "data-mode",
        "data-appearance",
        "data-color-scheme",
      ],
    };

    observer.observe(document.documentElement, observerOptions);

    if (document.body) {
      observer.observe(document.body, observerOptions);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener?.("change", updateLogoTheme);
    window.addEventListener("storage", updateLogoTheme);
    window.addEventListener("sidefx-theme-change", updateLogoTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener?.("change", updateLogoTheme);
      window.removeEventListener("storage", updateLogoTheme);
      window.removeEventListener("sidefx-theme-change", updateLogoTheme);
    };
  }, []);

  return (
    <Image
      src={logoTheme === "light" ? LOGO_LIGHT_SRC : LOGO_DARK_SRC}
      alt="SideFX"
      width={128}
      height={64}
      className="block h-auto w-32"
      sizes="128px"
    />
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[hsl(var(--landing-border))] bg-[hsl(var(--landing-bg))] px-6 py-12 text-[hsl(var(--landing-fg))]"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Top row */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + tagline */}
          <div className="max-w-xs space-y-3">
            <Link
              href="/"
              aria-label="SideFX home"
              className="landing-display inline-block rounded-md text-xl font-bold text-[hsl(var(--landing-fg))] transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--landing-accent))]"
            >
              <SideFxFooterLogo />
            </Link>

            <p className="text-xs leading-relaxed text-[hsl(var(--landing-fg-subtle))]">
              Track symptoms, monitor medications, and understand patterns in
              your health data. For personal use only — not medical advice.
            </p>

            <div className="h-px w-12 bg-[hsl(var(--landing-accent)/0.5)]" />
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
                Product
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/home", label: "Dashboard" },
                  { href: "/reports", label: "Reports" },
                  { href: "/log-symptom", label: "Log Symptom" },
                  { href: "/drug-search", label: "Drug Search" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[hsl(var(--landing-fg-muted))] transition-colors hover:text-[hsl(var(--landing-fg))]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
                Company
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/about", label: "About" },
                  { href: "/register", label: "Sign up" },
                  { href: "/login", label: "Sign in" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[hsl(var(--landing-fg-muted))] transition-colors hover:text-[hsl(var(--landing-fg))]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-fg-subtle))]">
                Legal
              </p>
              <ul className="space-y-2">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[hsl(var(--landing-fg-muted))] transition-colors hover:text-[hsl(var(--landing-fg))]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[hsl(var(--landing-border))] pt-6 text-xs text-[hsl(var(--landing-fg-subtle))] sm:flex-row sm:items-center">
          <p>&copy; {currentYear} GermFx. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[hsl(var(--landing-fg-muted))]"
            >
              Privacy
            </Link>
            <span className="opacity-30">·</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-[hsl(var(--landing-fg-muted))]"
            >
              Terms
            </Link>
            <span className="opacity-30">·</span>
            <a
              href="mailto:hello@GermFx"
              className="transition-colors hover:text-[hsl(var(--landing-fg-muted))]"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}