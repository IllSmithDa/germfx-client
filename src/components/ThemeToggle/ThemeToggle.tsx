"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  updateUserSettings,
  type ThemeValue,
} from "@/lib/client/userSettingsApi";

type ThemeOption = ThemeValue;

const OPTIONS: {
  id: ThemeOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "light", label: "Light", icon: <Sun size={16} /> },
  { id: "dark", label: "Dark", icon: <Moon size={16} /> },
  { id: "system", label: "System", icon: <Monitor size={16} /> },
];

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"
      >
        <span className="h-4 w-4 rounded-full bg-[hsl(var(--muted))] animate-pulse" />
      </button>
    );
  }

  const current = (theme ?? "system") as ThemeOption;
  const resolved = theme === "system" ? systemTheme : theme;
  const activeOption = OPTIONS.find((o) => o.id === current) ?? OPTIONS[2];

  async function handleSelect(nextTheme: ThemeOption) {
    const previousTheme = current;

    try {
      setSaving(true);
      setTheme(nextTheme);
      setOpen(false);

      await updateUserSettings({ theme: nextTheme });
    } catch (error) {
      console.error("Failed to save theme setting:", error);
      setTheme(previousTheme);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${activeOption.label}. Click to change theme.`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={saving}
        className={[
          "inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] cursor-pointer",
          "bg-[hsl(var(--card))] px-2.5 text-sm text-[hsl(var(--muted-foreground))]",
          "transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          showLabel ? "w-auto" : "w-8 px-0",
        ].join(" ")}
      >
        {activeOption.icon}

        {showLabel ? (
          <span className="hidden sm:inline">{activeOption.label}</span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-lg"
        >
          {OPTIONS.map((option) => {
            const active = option.id === current;

            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => handleSelect(option.id)}
                className={[
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
                  active
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>

                {active ? <Check size={14} /> : null}
              </button>
            );
          })}

          <div className="border-t border-[hsl(var(--border))] px-2.5 py-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            Current: {resolved ?? "system"}
          </div>
        </div>
      ) : null}
    </div>
  );
}