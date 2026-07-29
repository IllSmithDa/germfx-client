// components/NavbarNoAuth/NavbarNoAuth.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Info,
  LogIn,
  Menu,
  Newspaper,
  Search,
  Sparkles,
  UserPlus,
  X,
  House,
} from "lucide-react";

import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { CLIENT_PATHS } from "@/config/paths";

const DRUG_SEARCH_MAX_LENGTH = 100;

type LogoTheme = "light" | "dark";

const LOGO_LIGHT_SRC = "/logo/sidefx-logo-light.png";
const LOGO_DARK_SRC = "/logo/sidefx-logo.png";

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

function SideFxLogoImage({ className = "" }: { className?: string }) {
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
      width={120}
      height={64}
      priority
      className={[
        "block h-auto w-[92px] min-[360px]:w-[104px] sm:w-[120px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      sizes="(max-width: 359px) 92px, (max-width: 639px) 104px, 120px"
    />
  );
}


export default function NavbarNoAuth() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  useEffect(() => {
    const close = () => setDrawerOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !drawerOpen) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, drawerOpen]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value.slice(0, DRUG_SEARCH_MAX_LENGTH));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    const q = searchQuery.trim().slice(0, DRUG_SEARCH_MAX_LENGTH);

    if (!q) {
      return;
    }

    setSearchOpen(false);
    setSearchQuery("");
    setDrawerOpen(false);
    router.push(CLIENT_PATHS.searchResultsPath(q));
  }

  function toggleMobileDrawer() {
    setSearchOpen(false);
    setDrawerOpen((value) => !value);
  }

  const mainLinks = [
    {
      href: CLIENT_PATHS.homePath(),
      label: "Home",
      icon: <House size={16} />,
    },
    {
      href: CLIENT_PATHS.newsPage(1),
      label: "News",
      icon: <Newspaper size={16} />,
    },
    {
      href: CLIENT_PATHS.recallPage(1),
      label: "Recalls",
      icon: <AlertTriangle size={16} />,
    },
  ];

  const secondaryLinks = [
    {
      href: CLIENT_PATHS.pricingPath(),
      label: "Pricing",
      icon: <Sparkles size={16} />,
    },
    {
      href: CLIENT_PATHS.aboutPath(),
      label: "About",
      icon: <Info size={16} />,
    },
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--muted))]/60"
        role="navigation"
        aria-label="Main"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] lg:hidden"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              onClick={toggleMobileDrawer}
            >
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link
              href={CLIENT_PATHS.homePath()}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:px-1"
            >
              <SideFxLogoImage />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search drugs…"
                      autoComplete="off"
                      maxLength={DRUG_SEARCH_MAX_LENGTH}
                      className="h-8 w-44 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-9 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[hsl(var(--ring))] sm:w-56"
                    />

                    <button
                      type="submit"
                      aria-label="Submit drug search"
                      className="absolute inset-y-0 left-3 flex cursor-pointer items-center text-[hsl(var(--muted-foreground))]"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search drugs"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            <ThemeToggle />

            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={CLIENT_PATHS.clientLoginPath()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <LogIn size={14} />
                Log in
              </Link>

              <Link
                href={CLIENT_PATHS.clientRegisterPath()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <UserPlus size={14} />
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Full-screen mobile navigation ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/80 px-4 backdrop-blur">
              <Link
                href={CLIENT_PATHS.homePath()}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-1.5 rounded-md px-1 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <SideFxLogoImage />
              </Link>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search drugs…"
                    autoComplete="off"
                    maxLength={DRUG_SEARCH_MAX_LENGTH}
                    className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />

                  <button
                    type="submit"
                    aria-label="Submit drug search"
                    className="absolute inset-y-0 left-3 flex cursor-pointer items-center text-[hsl(var(--muted-foreground))]"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              <div className="space-y-1">
                {[...mainLinks, ...secondaryLinks].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  >
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-2.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                <span className="font-medium text-[hsl(var(--foreground))]">
                  SideFX
                </span>{" "}
                is for personal tracking and informational use only — not
                medical advice.
              </div>
            </div>

            <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
              <div className="grid gap-2">
                <Link
                  href={CLIENT_PATHS.clientLoginPath()}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  <LogIn size={16} />
                  Log in
                </Link>

                <Link
                  href={CLIENT_PATHS.clientRegisterPath()}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  <UserPlus size={16} />
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}