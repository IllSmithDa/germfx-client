// components/SymptomSuggest.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COMMON_SYMPTOMS } from "./common_side_effects";

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function SymptomSuggest({
  value,
  onChange,
  onPick,
  apiBase = "", // e.g. "" if proxied by Next; or "http://localhost:8000"
  minChars = 2,
  limit = 12,
  placeholder = 'e.g., "nausea", "headache", "fatigue"',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (v: string) => void | Promise<void>;
  apiBase?: string;
  minChars?: number;
  limit?: number;
  placeholder?: string;
  disabled?: boolean
}) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const debounced = useDebounce(value, 350);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const activeDescendant =
    activeIndex >= 0 && activeIndex < items.length
      ? `${inputId}-option-${activeIndex}`
      : undefined;

  // click outside to close
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  useEffect(() => {
    let cancel = false;

    async function fetchSuggestions() {
      setErr(null);

      const q = (debounced || "").trim();
      if (q.length < minChars) {
        setItems([]);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }

      try {
        setLoading(true);

        // Try API first
        const url = `${apiBase}/symptoms/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`;
        const resp = await fetch(url, { method: "GET" });
        let data: string[] | null = null;

        if (resp.ok) {
          const json = await resp.json();
          if (Array.isArray(json)) data = json;
        }

        // Fallback to local filter if API empty/unavailable
        if (!data || data.length === 0) {
          const lower = q.toLowerCase();
          const prefix = COMMON_SYMPTOMS.filter((s) =>
            s.toLowerCase().startsWith(lower)
          );
          const contains = COMMON_SYMPTOMS.filter(
            (s) => s.toLowerCase().includes(lower) && !prefix.includes(s)
          );
          data = [...prefix, ...contains].slice(0, limit);
        }

        if (!cancel) {
          setItems(data);
          setOpen(data.length > 0);
          setActiveIndex(data.length > 0 ? 0 : -1);
        }
      } catch {
        if (!cancel) {
          setErr("Could not fetch suggestions.");
          setItems([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    fetchSuggestions();

    return () => {
      cancel = true;
    };
  }, [debounced, apiBase, minChars, limit]);

  async function pickItem(symptom: string) {
    await onPick(symptom);
    setOpen(false);
    setActiveIndex(-1);
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (items.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (items.length === 0) return -1;
        return prev < items.length - 1 ? prev + 1 : 0;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        if (items.length === 0) return -1;
        return prev > 0 ? prev - 1 : items.length - 1;
      });
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < items.length) {
        e.preventDefault();
        await pickItem(items[activeIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        disabled={disabled}
        ref={inputRef}
        id={inputId}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if ((items.length ?? 0) > 0) setOpen(true);
        }}
        onFocus={() => {
          if (items.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border px-3 py-2 text-sm outline-none",
          "bg-transparent",
          "border-[hsl(var(--input))]",
          "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]",
          "focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer",
        ].join(" ")}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
      />

      {open && (
        <div
          id={listboxId}
          className={[
            "absolute z-20 mt-1 w-full overflow-hidden rounded-xl border shadow-sm",
            "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]",
          ].join(" ")}
          role="listbox"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              Searching…
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              No matches
            </div>
          )}

          {!loading &&
            items.map((s, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  disabled={disabled}
                  type="button"
                  key={s}
                  id={`${inputId}-option-${index}`}
                  className={[
                    "block w-full px-3 py-2 text-left text-sm cursor-pointer",
                    "transition-colors focus:outline-none cursor-pointer",
                    isActive
                      ? "bg-[hsl(var(--muted))]"
                      : "hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))]",
                  ].join(" ")}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    // Prevent input blur before click handler finishes
                    e.preventDefault();
                  }}
                  onClick={async () => {
                    await pickItem(s);
                  }}
                >
                  {s}
                </button>
              );
            })}
        </div>
      )}

      {err && (
        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{err}</p>
      )}

      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        Suggestions are common symptoms. Not medical advice.
      </p>
    </div>
  );
}