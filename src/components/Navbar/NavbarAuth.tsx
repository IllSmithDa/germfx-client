// components/NavbarAuth/NavbarAuth.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  NotebookPen,
  ChevronDown,
  AlertTriangle,
  User,
  FileText,
  LogOut,
  Settings,
  House,
  Newspaper,
  Bookmark,
  ClipboardList,
  Pill,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Search,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import FeedbackModal from "../UserFeedback/FeedbackModal";
import { CLIENT_PATHS } from "@/config/paths";
import { User as UserType } from "@/types/index";

const DRUG_SEARCH_MAX_LENGTH = 100;

type SubscriptionSnapshot = {
  is_plus?: boolean | null;
  plan?: string | null;
  status?: string | null;
};

type SubscriptionAwareUser = UserType & {
  is_plus?: boolean | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription?: SubscriptionSnapshot | null;
};

function isPaidAccount(user: UserType | null) {
  const account = user as SubscriptionAwareUser | null;
  const subscription = account?.subscription;

  const plan = String(
    subscription?.plan ?? account?.subscription_plan ?? "free",
  ).toLowerCase();

  const status = String(
    subscription?.status ?? account?.subscription_status ?? "free",
  ).toLowerCase();

  return (
    Boolean(subscription?.is_plus) ||
    Boolean(account?.is_plus) ||
    ((plan === "plus" || plan === "pro") &&
      (status === "active" || status === "trialing"))
  );
}


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

export default function NavbarAuth({ user }: { user: UserType | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isAdmin = (user as { role?: string } | null)?.role === "admin";
  const shouldShowUpgradeButton = !isPaidAccount(user);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }

    if (menuOpen || searchOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const close = () => {
      setDrawerOpen(false);
      setMenuOpen(false);
      setSearchOpen(false);
    };

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
    if (!menuOpen && !searchOpen && !drawerOpen) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen, searchOpen, drawerOpen]);

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
    setDrawerOpen(false);
    setSearchQuery("");
    router.push(CLIENT_PATHS.searchResultsPath(q));
  }

  function openMobileMenu() {
    setMenuOpen(false);
    setSearchOpen(false);
    setDrawerOpen(true);
  }

  function closeMobileMenu() {
    setDrawerOpen(false);
  }

  function openFeedback() {
    setMenuOpen(false);
    setDrawerOpen(false);
    setSearchOpen(false);
    setFeedbackOpen(true);
  }

  async function logout() {
    try {
      setMenuOpen(false);
      setDrawerOpen(false);
      setSearchOpen(false);

      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Logout proxy failed:", res.status);
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      window.location.href = "/login";
    }
  }

  const initials =
    user?.username
      ?.trim()
      ?.split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const displayName = user?.username || "Account";
  const displayEmail = user?.email || "your account";

  const userAvatar = user?.avatarUrl ? (
    <Image
      src={user.avatarUrl}
      alt={user?.username || user?.email || "User"}
      width={24}
      height={24}
      className="rounded-full"
    />
  ) : (
    <span className="grid size-6 place-items-center rounded-full border border-sky-400/30 bg-sky-500/15 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
      {initials}
    </span>
  );

  const mobileNavigationAvatar = user?.avatarUrl ? (
    <Image
      src={user.avatarUrl}
      alt=""
      width={36}
      height={36}
      className="size-full object-cover"
      aria-hidden="true"
    />
  ) : (
    <span
      aria-hidden="true"
      className="text-xs font-semibold text-sky-600 dark:text-sky-400"
    >
      {initials}
    </span>
  );

  const largeUserAvatar = user?.avatarUrl ? (
    <Image
      src={user.avatarUrl}
      alt={user?.username || user?.email || "User"}
      width={42}
      height={42}
      className="rounded-full"
    />
  ) : (
    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-sky-400/30 sm:size-10 bg-sky-500/15 text-sm font-semibold text-sky-600 dark:text-sky-400">
      {initials}
    </span>
  );

  const navLinks = [
    {
      href: CLIENT_PATHS.homePath(),
      label: "Home",
      icon: <House size={16} />,
    },
    {
      href: CLIENT_PATHS.userMedicationsPath(),
      label: "Medications",
      icon: <Pill size={16} />,
    },
    {
      href: CLIENT_PATHS.symptomLogsPath(),
      label: "Symptoms",
      icon: <ClipboardList size={16} />,
    },
    {
      href: CLIENT_PATHS.logSymptomsPath(),
      label: "Log Symptom",
      icon: <NotebookPen size={16} />,
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
    {
      href: CLIENT_PATHS.drugSearchPage(),
      label: "Search Medications",
      icon: <Search size={16} />,
    },
    { href: "/bookmarks", label: "Bookmarks", icon: <Bookmark size={16} /> },
    { href: "/reports", label: "Reports", icon: <FileText size={16} /> },
    { href: "/account", label: "Account", icon: <User size={16} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={16} /> },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            icon: <ShieldCheck size={16} />,
          },
        ]
      : []),
  ];

  const mobileLinks = navLinks.filter(
    (link) => link.href !== CLIENT_PATHS.logSymptomsPath(),
  );

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--muted))]/60"
        role="navigation"
        aria-label="Authenticated"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-1.5 px-2.5 min-[380px]:gap-2 min-[380px]:px-3 sm:gap-3 sm:px-4 lg:px-6">
          <div
            className={
              searchOpen
                ? "hidden min-w-0 items-center gap-2 lg:flex"
                : "flex min-w-0 items-center gap-2"
            }
          >
            <button
              type="button"
              className="inline-grid size-9 shrink-0 touch-manipulation select-none cursor-pointer place-items-center overflow-hidden rounded-full sm:size-10 border border-sky-400/30 bg-sky-500/15 text-sky-600 transition-[background-color,border-color,color,transform] duration-100 hover:border-sky-400/50 hover:bg-sky-500/20 active:scale-[0.94] active:border-sky-400/60 active:bg-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--muted))] motion-reduce:transform-none dark:text-sky-400 lg:hidden"
              aria-label="Open account navigation"
              aria-expanded={drawerOpen}
              aria-controls="authenticated-mobile-menu"
              onClick={openMobileMenu}
            >
              {mobileNavigationAvatar}
            </button>

            <Link
              href={CLIENT_PATHS.homePath()}
              className="flex shrink-0 touch-manipulation select-none items-center gap-1.5 rounded-md px-0 transition-[opacity,transform] duration-100 hover:opacity-80 active:scale-[0.98] active:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none sm:px-1"
            >
              <SideFxLogoImage />
            </Link>

            <div className="ml-3 hidden items-center gap-1.5 lg:flex">
              <button
                type="button"
                onClick={openFeedback}
                className="inline-flex touch-manipulation select-none cursor-pointer items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.97] active:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
              >
                <MessageSquare
                  size={14}
                  className="text-[hsl(var(--muted-foreground))]"
                />
                Feedback
              </button>

              {shouldShowUpgradeButton ? (
                <Link
                  href={CLIENT_PATHS.pricingPath()}
                  className="inline-flex touch-manipulation select-none items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-600 transition-[background-color,transform] duration-100 hover:bg-sky-500/20 active:scale-[0.97] active:bg-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none dark:text-sky-400"
                >
                  <Sparkles size={14} className="shrink-0" />
                  Upgrade
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 ">
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center"
                >
                  <div className="relative ">
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
                      className="absolute inset-y-0 left-3 flex touch-manipulation select-none cursor-pointer items-center text-[hsl(var(--muted-foreground))] transition-[color,transform] duration-100 active:scale-[0.9] active:text-[hsl(var(--primary))] motion-reduce:transform-none"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSearchOpen(true);
                  }}
                  aria-label="Search drugs"
                  className="inline-flex h-8 w-8 touch-manipulation select-none cursor-pointer items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition-[background-color,color,transform] duration-100 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-[0.92] active:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            <ThemeToggle />

            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setMenuOpen((v) => !v);
                }}
                className="inline-flex touch-manipulation select-none cursor-pointer items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-sm transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.97] active:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User menu"
              >
                {userAvatar}

                <span className="hidden max-w-[14ch] truncate text-[hsl(var(--foreground))] sm:inline">
                  {user?.username || user?.email || "Account"}
                </span>

                <ChevronDown
                  size={13}
                  className={[
                    "shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-150",
                    menuOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-56 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg"
                  role="menu"
                >
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

                  <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border))] px-3.5 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-sky-400/30 bg-sky-500/15 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {initials}
                    </span>

                    <div className="min-w-0">
                      {user?.username && (
                        <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                          {user.username}
                        </p>
                      )}
                      <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {user?.email || "your account"}
                      </p>
                    </div>
                  </div>

                  <div className="py-1">
                    {[
                      {
                        href: CLIENT_PATHS.homePath(),
                        icon: <House size={14} />,
                        label: "Dashboard",
                      },
                      {
                        href: CLIENT_PATHS.userMedicationsPath(),
                        label: "Medications",
                        icon: <Pill size={14} />,
                      },
                      {
                        href: CLIENT_PATHS.symptomLogsPath(),
                        label: "Symptoms",
                        icon: <ClipboardList size={14} />,
                      },
                      {
                        href: CLIENT_PATHS.newsPage
                          ? CLIENT_PATHS.newsPage(1)
                          : "/news",
                        icon: <Newspaper size={14} />,
                        label: "News",
                      },
                      {
                        href: CLIENT_PATHS.recallPage
                          ? CLIENT_PATHS.recallPage(1)
                          : "/recalls",
                        icon: <AlertTriangle size={14} />,
                        label: "Recalls",
                      },
                      {
                        href: CLIENT_PATHS.reportsPath(),
                        icon: <FileText size={14} />,
                        label: "Reports",
                      },
                      {
                        href: CLIENT_PATHS.bookmarksPath(),
                        icon: <Bookmark size={14} />,
                        label: "Bookmarks",
                      },
                      {
                        href: CLIENT_PATHS.accountsPath(),
                        icon: <User size={14} />,
                        label: "Account",
                      },
                      {
                        href: CLIENT_PATHS.settingsPath(),
                        icon: <Settings size={14} />,
                        label: "Settings",
                      },
                      ...(isAdmin
                        ? [
                            {
                              href: CLIENT_PATHS.adminHomePath(),
                              icon: <ShieldCheck size={14} />,
                              label: "Admin",
                            },
                          ]
                        : []),
                    ].map(({ href, icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex touch-manipulation select-none items-center gap-2.5 px-3.5 py-2 text-sm text-[hsl(var(--foreground))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.99] active:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] focus:outline-none motion-reduce:transform-none"
                      >
                        <span className="text-[hsl(var(--muted-foreground))]">
                          {icon}
                        </span>
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-[hsl(var(--border))] py-1">
                    <button
                      type="button"
                      onClick={openFeedback}
                      role="menuitem"
                      className="flex w-full touch-manipulation select-none cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-[hsl(var(--foreground))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.99] active:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] focus:outline-none motion-reduce:transform-none"
                    >
                      <MessageSquare
                        size={14}
                        className="text-[hsl(var(--muted-foreground))]"
                      />
                      Feedback
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      role="menuitem"
                      className="flex w-full touch-manipulation select-none cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-[hsl(var(--destructive))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.99] active:bg-[hsl(var(--destructive)/0.1)] focus:bg-[hsl(var(--muted))] focus:outline-none motion-reduce:transform-none"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div
          id="authenticated-mobile-menu"
          className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Account navigation"
        >
          <div className="flex min-h-14 shrink-0 items-center justify-between gap-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/80 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur sm:min-h-16 sm:gap-3 sm:px-4 sm:pb-3 sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex min-w-0 items-center gap-3">
              {largeUserAvatar}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                  {displayName}
                </p>
                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                  {displayEmail}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close account navigation"
              onClick={closeMobileMenu}
              className="touch-manipulation select-none cursor-pointer rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] sm:p-2 transition-[background-color,color,transform] duration-100 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-[0.92] active:bg-[hsl(var(--primary)/0.15)] active:text-[hsl(var(--primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
              <div className="space-y-1">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex min-h-10 touch-manipulation select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium sm:min-h-11 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5 text-[hsl(var(--foreground))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.985] active:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] sm:size-8 sm:rounded-lg">
                      {link.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="my-2 h-px bg-[hsl(var(--border))] sm:my-3" />

              <div className="space-y-1">
                {shouldShowUpgradeButton ? (
                  <Link
                    href={CLIENT_PATHS.pricingPath()}
                    onClick={closeMobileMenu}
                    className="flex min-h-10 w-full touch-manipulation select-none items-center gap-2.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-2.5 py-2 text-sm font-semibold sm:min-h-11 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5 text-sky-600 transition-[background-color,transform] duration-100 hover:bg-sky-500/20 active:scale-[0.985] active:bg-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none dark:text-sky-400"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sky-500/10 sm:size-8 sm:rounded-lg">
                      <Sparkles size={17} />
                    </span>
                    Upgrade
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={openFeedback}
                  className="flex min-h-10 w-full touch-manipulation select-none cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium sm:min-h-11 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5 text-[hsl(var(--foreground))] transition-[background-color,transform] duration-100 hover:bg-[hsl(var(--muted))] active:scale-[0.985] active:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                    <MessageSquare size={17} />
                  </span>
                  Feedback
                </button>
              </div>
            </div>

            <div className="relative z-10 shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/98 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:px-3 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3 lg:px-4">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-10 w-full touch-manipulation select-none cursor-pointer items-center justify-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.06)] px-2.5 py-2 text-sm font-semibold sm:min-h-11 sm:gap-2.5 sm:rounded-xl sm:px-3 sm:py-2.5 text-[hsl(var(--destructive))] transition-[background-color,border-color,transform] duration-100 hover:bg-[hsl(var(--destructive)/0.1)] active:scale-[0.985] active:border-[hsl(var(--destructive)/0.4)] active:bg-[hsl(var(--destructive)/0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none"
              >
                <LogOut size={17} className="shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        defaultCategory="general"
      />
    </>
  );
}