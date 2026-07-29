"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CLIENT_PATHS } from "@/config/paths";
import {
  ApiUsageLimitError,
  checkSavedItem,
  deleteSavedItem,
  saveItem,
} from "@/lib/client/savedItems";

function hasValidUserId(userId?: number | string | null) {
  if (userId === null || userId === undefined) {
    return false;
  }

  return String(userId).trim().length > 0;
}

export default function SaveNewsButton({
  articleId,
  initialSaved,
  initialSavedItemId = null,
  userId = null,
}: {
  articleId: number;
  initialSaved?: boolean;
  initialSavedItemId?: number | null;
  userId?: number | string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthenticated = hasValidUserId(userId);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [savedItemId, setSavedItemId] = useState<number | null>(
    initialSavedItemId ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  function redirectToLogin() {
    const queryString = searchParams.toString();
    const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(
      `${CLIENT_PATHS.clientLoginPath()}?next=${encodeURIComponent(nextPath)}`,
    );
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (typeof initialSaved === "boolean") {
      return;
    }

    let ignore = false;

    async function loadSavedState() {
      try {
        setError(null);

        const result = await checkSavedItem({
          content_type: "news",
          source_item_id: articleId,
        });

        if (ignore) return;

        setSaved(Boolean(result.saved));
        setSavedItemId(result.saved_item_id ?? null);
      } catch (err) {
        if (ignore) return;
        console.error(err);
        setError("Unable to check saved status.");
      }
    }

    void loadSavedState();

    return () => {
      ignore = true;
    };
  }, [articleId, initialSaved, isAuthenticated]);

  async function handleToggleSave() {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!saved) {
        const result = await saveItem({
          content_type: "news",
          source_item_id: articleId,
        });

        setSaved(true);
        setSavedItemId(result.id);
        return;
      }

      if (savedItemId != null) {
        await deleteSavedItem(savedItemId);
        setSaved(false);
        setSavedItemId(null);
      }
    } catch (err) {
      console.error(err);

      if (
        err instanceof ApiUsageLimitError &&
        err.code === "FREE_LIMIT_REACHED" &&
        err.featureKey === "saved_items"
      ) {
        router.push("/news?limit=saved_items");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : saved
            ? "Unable to remove saved news."
            : "Unable to save news.",
      );
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading ? "Saving..." : saved ? "Saved" : "Save";
  const buttonTitle = isAuthenticated
    ? buttonLabel
    : "Log in to save this article";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggleSave}
        disabled={loading}
        aria-pressed={saved}
        aria-label={buttonTitle}
        title={buttonTitle}
        className={[
          "inline-flex h-8 min-w-10 shrink-0 cursor-pointer items-center justify-center !rounded-lg border px-3 leading-none transition-colors disabled:opacity-60",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          "sm:h-auto sm:min-w-0 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:font-semibold",
          saved
            ? "border-amber-400/35 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
            : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
        ].join(" ")}
      >
        <svg
          className="block h-3.5 w-3.5 shrink-0"
          viewBox="0 0 16 16"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M4.5 2.5h7a1 1 0 0 1 1 1v10l-4-2.5-4 2.5v-10a1 1 0 0 1 1-1Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="hidden sm:inline">{buttonLabel}</span>
      </button>

      {error ? (
        <p className="text-[10px] text-[hsl(var(--destructive))] sm:text-[11px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}