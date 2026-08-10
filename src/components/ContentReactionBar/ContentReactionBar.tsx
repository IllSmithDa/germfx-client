// src/components/Reactions/ContentReactionBar.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CLIENT_PATHS } from "@/config/paths";

import {
  toggleReaction,
  emptySummary,
  type ReactionContentType,
  type ReactionSummary,
  type ReactionType,
} from "@/lib/client/reactionApi";

const REACTIONS: Array<{
  type: ReactionType;
  label: string;
  icon: string;
}> = [
  {
    type: "like",
    label: "Like",
    icon: "👍",
  },
  {
    type: "amazed",
    label: "Amazed",
    icon: "😮",
  },
  {
    type: "concerned",
    label: "Concerned",
    icon: "‼️",
  },
];

function clampCount(value: number) {
  return Math.max(0, value);
}

function hasValidUserId(userId?: number | string | null) {
  if (userId === null || userId === undefined) {
    return false;
  }

  return String(userId).trim().length > 0;
}

function getOptimisticSummary(
  current: ReactionSummary,
  nextReactionType: ReactionType,
): ReactionSummary {
  const previousReaction = current.user_reaction;

  const isRemovingReaction = previousReaction === nextReactionType;

  const nextCounts = {
    ...current.counts,
  };

  if (previousReaction) {
    nextCounts[previousReaction] = clampCount(
      (nextCounts[previousReaction] ?? 0) - 1,
    );
  }

  if (!isRemovingReaction) {
    nextCounts[nextReactionType] = clampCount(
      (nextCounts[nextReactionType] ?? 0) + 1,
    );
  }

  return {
    ...current,
    user_reaction: isRemovingReaction ? null : nextReactionType,
    counts: nextCounts,
  };
}

export default function ContentReactionBar({
  contentType,
  sourceItemId,
  initialSummary,
  userId,
}: {
  contentType: ReactionContentType;
  sourceItemId: number;
  initialSummary?: ReactionSummary;
  userId?: number | string | null;
}) {
  const [loadingType, setLoadingType] = useState<ReactionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fallbackSummary = emptySummary(contentType, sourceItemId);

  const [summary, setSummary] = useState<ReactionSummary>(
    initialSummary ?? fallbackSummary,
  );

  const cacheKey = `sidefx.reaction.${contentType}.${sourceItemId}`;

  const isAuthenticated = hasValidUserId(userId);

  function redirectToLogin() {
    const queryString = searchParams.toString();

    const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(
      `${CLIENT_PATHS.clientLoginPath()}?next=${encodeURIComponent(nextPath)}`,
    );
  }

  useEffect(() => {
    if (!initialSummary) {
      return;
    }

    setSummary((prev) => {
      if (
        prev.user_reaction &&
        prev.user_reaction !== initialSummary.user_reaction
      ) {
        return prev;
      }

      return initialSummary;
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(initialSummary));
  }, [cacheKey, initialSummary]);

  async function handleReaction(reactionType: ReactionType) {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (loadingType !== null) {
      return;
    }

    setError(null);
    setLoadingType(reactionType);

    const previousSummary = summary;

    const optimisticSummary = getOptimisticSummary(
      previousSummary,
      reactionType,
    );

    setSummary(optimisticSummary);
    sessionStorage.setItem(cacheKey, JSON.stringify(optimisticSummary));

    try {
      const result = await toggleReaction({
        content_type: contentType,
        source_item_id: sourceItemId,
        reaction_type: reactionType,
      });

      if (!result.ok || !result.data) {
        setSummary(previousSummary);
        sessionStorage.setItem(cacheKey, JSON.stringify(previousSummary));
        setError(result.error ?? "Unable to update reaction.");
        return;
      }

      const confirmedSummary = result.data as ReactionSummary;

      setSummary(confirmedSummary);
      sessionStorage.setItem(cacheKey, JSON.stringify(confirmedSummary));

      router.refresh();
    } catch {
      setSummary(previousSummary);
      sessionStorage.setItem(cacheKey, JSON.stringify(previousSummary));
      setError("Unable to update reaction.");
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
      {error && <div className="text-xs text-red-500 sm:text-sm">{error}</div>}

      {REACTIONS.map((reaction) => {
        const active = summary.user_reaction === reaction.type;

        const count = summary.counts[reaction.type] ?? 0;

        const isLoading = loadingType === reaction.type;

        return (
          <button
            key={reaction.type}
            type="button"
            onClick={() => handleReaction(reaction.type)}
            disabled={loadingType !== null}
            aria-pressed={active}
            title={
              isAuthenticated
                ? reaction.label
                : "Log in to react to this article"
            }
            className={[
              "group no-touch-feedback inline-flex min-h-7 touch-manipulation select-none cursor-pointer items-center justify-center gap-1.5 rounded-full border px-2 py-1 text-[12px] font-medium leading-none sm:min-h-8 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs",
              "transition-[background-color,border-color,color,transform] duration-100 ease-out",
              "active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transform-none",
              active
                ? "border-violet-400/50 bg-violet-500/15 text-violet-700 active:border-violet-400/70 active:bg-violet-500/25 dark:text-violet-300"
                : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] active:border-[hsl(var(--primary)/0.4)] active:bg-[hsl(var(--primary)/0.12)] active:text-[hsl(var(--primary))]",
              isLoading ? "animate-pulse" : "",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="text-xs leading-none transition-transform duration-100 group-active:scale-110 motion-reduce:transform-none sm:text-sm"
            >
              {reaction.icon}
            </span>

            <span className="leading-none">{count}</span>
          </button>
        );
      })}
    </div>
  );
}