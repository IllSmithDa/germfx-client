"use client";

import Link from "next/link";
import type React from "react";
import { useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SharedTabItem<T extends string> = {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  /** Tailwind classes for the count badge. */
  countColor?: string;
  /** If provided, renders a Next.js Link instead of a button. */
  href?: string;
  /** Grays out the tab and prevents interaction. */
  disabled?: boolean;
};

export type SharedTabsLayout = "auto" | "full" | "compact";
export type SharedTabsAlign = "start" | "center" | "end";

type HideUntil = "never" | "md" | "lg";
type HideCountUntil = HideUntil | "always";

// ── Helpers ───────────────────────────────────────────────────────────────────

function cls(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SharedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "Tabs",
  hideLabelsUntil = "never",
  hideCountsUntil = "never",
  layout = "auto",
  align = "start",
  mobileBottomBar = true,
}: {
  tabs: SharedTabItem<T>[];
  activeTab: T;
  onChange?: (tab: T) => void;
  ariaLabel?: string;
  hideLabelsUntil?: HideUntil;
  hideCountsUntil?: HideCountUntil;
  /**
   * auto:
   * - 1–2 tabs use a compact segmented control on lg+ screens.
   * - 3+ tabs retain the full-width tab bar.
   *
   * compact and full can be used to override the automatic behavior.
   */
  layout?: SharedTabsLayout;
  /** Alignment used by the compact desktop layout. */
  align?: SharedTabsAlign;
  /** Pins the tabs to the bottom of mobile screens. */
  mobileBottomBar?: boolean;
}) {
  useEffect(() => {
    if (!mobileBottomBar || tabs.length === 0) return;

    document.body.classList.add("has-shared-mobile-tabs");
    return () => {
      document.body.classList.remove("has-shared-mobile-tabs");
    };
  }, [mobileBottomBar, tabs.length]);

  if (tabs.length === 0) {
    return null;
  }

  const isCompact =
    layout === "compact" || (layout === "auto" && tabs.length <= 2);

  const labelClass = cls(
    "min-w-0 max-w-full truncate whitespace-nowrap",
    mobileBottomBar
      ? "text-[10px] leading-4 lg:text-[12px] lg:leading-5"
      : "leading-5",
    hideLabelsUntil === "md" && "hidden md:inline",
    hideLabelsUntil === "lg" && "hidden lg:inline",
  );

  const countVisibilityClass =
    hideCountsUntil === "always"
      ? "hidden"
      : hideCountsUntil === "md"
        ? "hidden md:inline-flex"
        : hideCountsUntil === "lg"
          ? "hidden lg:inline-flex"
          : "inline-flex";

  const compactAlignmentClass =
    align === "center"
      ? "lg:justify-center"
      : align === "end"
        ? "lg:justify-end"
        : "lg:justify-start";

  function tabButtonClass(isActive: boolean, disabled: boolean) {
    return cls(
      "relative flex min-w-0 items-center justify-center touch-manipulation",
      mobileBottomBar
        ? "min-h-14 w-full border-r border-[hsl(var(--border))] px-1.5 py-1.5 lg:min-h-12 lg:px-3 lg:py-3"
        : isCompact
          ? cls(
              "min-h-12 w-full border-r border-[hsl(var(--border))]",
              "last:border-r-0 px-4 py-3 lg:min-w-40",
            )
          : cls(
              "min-h-12 w-full border-r border-[hsl(var(--border))]",
              "last:border-r-0 px-2 py-2.5 lg:px-3 lg:py-3",
            ),
      "last:border-r-0",
      mobileBottomBar
        ? "text-center text-[10px] font-semibold leading-tight lg:text-sm lg:leading-normal"
        : "text-center text-xs font-semibold leading-normal sm:text-md",
      "transition-[background-color,color] duration-150",
      "focus:outline-none focus-visible:z-10",
      "focus-visible:ring-2 focus-visible:ring-inset",
      "focus-visible:ring-[hsl(var(--ring))]",
      disabled
        ? "cursor-not-allowed opacity-40"
        : "cursor-pointer active:bg-[hsl(var(--muted)/0.8)]",
      isActive
        ? mobileBottomBar
          ? cls(
              "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]",
              isCompact
                ? "lg:bg-transparent lg:text-[hsl(var(--foreground))]"
                : "lg:bg-[hsl(var(--background))] lg:text-[hsl(var(--foreground))]",
            )
          : isCompact
            ? "bg-transparent text-[hsl(var(--foreground))]"
            : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
        : cls(
            "text-[hsl(var(--muted-foreground))]",
            "bg-transparent",
            !disabled &&
              cls(
                "hover:text-[hsl(var(--foreground))]",
                isCompact
                  ? "hover:bg-[hsl(var(--muted)/0.35)]"
                  : "hover:bg-[hsl(var(--muted)/0.6)]",
              ),
          ),
    );
  }

  function countBadgeClass(tab: SharedTabItem<T>, isActive: boolean) {
    return cls(
      countVisibilityClass,
      "h-5 min-w-5 items-center justify-center rounded-full border px-1.5",
      "text-[10px] font-semibold leading-none tabular-nums",
      tab.countColor ??
        (isActive
          ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"),
    );
  }

  function renderContent(tab: SharedTabItem<T>, isActive: boolean) {
    return (
      <>
        <span
          className={cls(
            "flex min-w-0 max-w-full items-center justify-center",
            mobileBottomBar
              ? "flex-col gap-0.5 lg:flex-row lg:gap-2"
              : "gap-1.5 leading-normal sm:gap-2",
          )}
        >
          {tab.icon && (
            <span
              aria-hidden="true"
              className={cls(
                "shrink-0 leading-none",
                "[&>svg]:block [&>svg]:h-4 [&>svg]:w-4",
                mobileBottomBar
                  ? "lg:[&>svg]:h-[18px] lg:[&>svg]:w-[18px]"
                  : "sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]",
                isActive
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))]",
              )}
            >
              {tab.icon}
            </span>
          )}

          <span className={labelClass}>{tab.label}</span>

          {tab.count != null &&
            tab.count > 0 &&
            hideCountsUntil !== "always" && (
              <span
                className={cls(
                  countBadgeClass(tab, isActive),
                  mobileBottomBar && "max-lg:absolute max-lg:right-1 max-lg:top-1",
                )}
              >
                {tab.count > 99 ? "99+" : tab.count}
              </span>
            )}
        </span>

        <span
          aria-hidden="true"
          className={cls(
            "absolute inset-x-0 h-0.5 bg-[hsl(var(--primary))]",
            mobileBottomBar ? "top-0 lg:top-auto lg:bottom-0" : "bottom-0",
            "transition-[opacity,transform] duration-150",
            isActive
              ? "scale-x-100 opacity-100"
              : "scale-x-75 opacity-0",
          )}
        />
      </>
    );
  }

  return (
    <>
      {mobileBottomBar ? (
        <style jsx global>{`
          @media (max-width: 1023px) {
            body.has-shared-mobile-tabs {
              padding-bottom: calc(3.5rem + env(safe-area-inset-bottom));
            }
          }
        `}</style>
      ) : null}

      <div
        role="none"
        className={cls(
          "flex w-full",
          mobileBottomBar &&
            "fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--tabs-surface))] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:z-auto lg:border-t-0 lg:bg-transparent lg:pb-0 lg:backdrop-blur-none",
          isCompact ? compactAlignmentClass : "justify-stretch",
        )}
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          className={cls(
            "grid w-full overflow-hidden bg-[hsl(var(--tabs-surface))]",
            mobileBottomBar
              ? "border-0 shadow-none lg:rounded-xl lg:border lg:border-[hsl(var(--border))] lg:shadow-sm"
              : "rounded-xl border border-[hsl(var(--border))] shadow-sm",
            isCompact && "lg:inline-grid lg:w-auto",
          )}
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const disabled = tab.disabled ?? false;

            const sharedProps = {
              role: "tab" as const,
              "aria-selected": isActive,
              "aria-disabled": disabled || undefined,
              "aria-label": tab.label,
              title: tab.label,
              className: tabButtonClass(isActive, disabled),
            };

            if (tab.href && !disabled) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  {...sharedProps}
                >
                  {renderContent(tab, isActive)}
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                disabled={disabled}
                onClick={disabled ? undefined : () => onChange?.(tab.id)}
                {...sharedProps}
              >
                {renderContent(tab, isActive)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}