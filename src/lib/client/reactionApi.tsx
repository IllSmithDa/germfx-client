// src/lib/client/reactionApi.tsx

import {
  fetchWithClientRefresh,
} from "./clientRefresh";

export type ReactionContentType =
  | "news"
  | "recall";

export type ReactionType =
  | "like"
  | "amazed"
  | "concerned";

export type ReactionCounts =
  Record<ReactionType, number>;

export type ReactionSummary = {
  content_type: ReactionContentType;
  source_item_id: number;
  user_reaction: ReactionType | null;
  counts: ReactionCounts;
};

export type ToggleReactionPayload = {
  content_type: ReactionContentType;
  source_item_id: number;
  reaction_type: ReactionType;
};

export type ReactionApiResult<
  T = ReactionSummary,
> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

const EMPTY_COUNTS: ReactionCounts = {
  like: 0,
  amazed: 0,
  concerned: 0,
};

export function emptySummary(
  contentType: ReactionContentType,
  sourceItemId: number
): ReactionSummary {
  return {
    content_type: contentType,
    source_item_id: sourceItemId,
    user_reaction: null,
    counts: {
      ...EMPTY_COUNTS,
    },
  };
}

function reactionSummaryProxyPath(
  contentType: ReactionContentType,
  sourceItemId: number
) {
  const search =
    new URLSearchParams({
      content_type: contentType,
      source_item_id:
        String(sourceItemId),
    });

  return `/api/backend/reactions/summary?${search.toString()}`;
}

function toggleReactionProxyPath() {
  return "/api/backend/reactions/toggle";
}

function deleteReactionProxyPath(
  contentType: ReactionContentType,
  sourceItemId: number
) {
  const search =
    new URLSearchParams({
      content_type: contentType,
      source_item_id:
        String(sourceItemId),
    });

  return `/api/backend/reactions?${search.toString()}`;
}

function normalizeSummary(
  data: Partial<ReactionSummary>,
  fallback?: {
    contentType: ReactionContentType;
    sourceItemId: number;
  }
): ReactionSummary {
  return {
    content_type:
      (data.content_type as ReactionContentType) ??
      fallback?.contentType ??
      "news",

    source_item_id:
      Number(
        data.source_item_id ??
          fallback?.sourceItemId ??
          0
      ),

    user_reaction:
      (data.user_reaction ??
        null) as ReactionType | null,

    counts: {
      like: Number(
        data.counts?.like ?? 0
      ),
      amazed: Number(
        data.counts?.amazed ?? 0
      ),
      concerned: Number(
        data.counts?.concerned ?? 0
      ),
    },
  };
}

async function getErrorMessage(
  response: Response,
  fallback: string
) {
  try {
    const data =
      await response.json();

    if (
      typeof data?.detail ===
      "string"
    ) {
      return data.detail;
    }

    if (
      Array.isArray(data?.detail)
    ) {
      const firstMessage =
        data.detail.find(
          (item: unknown) =>
            item &&
            typeof item ===
              "object" &&
            "msg" in item
        );

      if (
        firstMessage &&
        typeof firstMessage ===
          "object" &&
        "msg" in firstMessage &&
        typeof firstMessage.msg ===
          "string"
      ) {
        return firstMessage.msg;
      }

      return JSON.stringify(
        data.detail
      );
    }

    if (data?.detail) {
      return JSON.stringify(
        data.detail
      );
    }

    if (
      typeof data?.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
      "string"
    ) {
      return data.error;
    }
  } catch {
    // ignore parse failures
  }

  return fallback;
}

export async function fetchReactionSummary(params: {
  content_type: ReactionContentType;
  source_item_id: number;
}): Promise<ReactionApiResult> {
  const response =
    await fetchWithClientRefresh(
      reactionSummaryProxyPath(
        params.content_type,
        params.source_item_id
      ),
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
        },
        cache: "no-store",
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        await getErrorMessage(
          response,
          "Failed to fetch reaction summary"
        ),
      data: emptySummary(
        params.content_type,
        params.source_item_id
      ),
    };
  }

  const data =
    await response.json();

  return {
    ok: true,
    data: normalizeSummary(
      data,
      {
        contentType:
          params.content_type,
        sourceItemId:
          params.source_item_id,
      }
    ),
  };
}

export async function toggleReaction(
  payload: ToggleReactionPayload
): Promise<ReactionApiResult> {
  const response =
    await fetchWithClientRefresh(
      toggleReactionProxyPath(),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        await getErrorMessage(
          response,
          "Failed to update reaction"
        ),
    };
  }

  const data =
    await response.json();

  return {
    ok: true,
    data: normalizeSummary(
      data,
      {
        contentType:
          payload.content_type,
        sourceItemId:
          payload.source_item_id,
      }
    ),
  };
}

export async function deleteReaction(params: {
  content_type: ReactionContentType;
  source_item_id: number;
}): Promise<ReactionApiResult> {
  const response =
    await fetchWithClientRefresh(
      deleteReactionProxyPath(
        params.content_type,
        params.source_item_id
      ),
      {
        method: "DELETE",
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        await getErrorMessage(
          response,
          "Failed to remove reaction"
        ),
    };
  }

  const data =
    await response.json();

  return {
    ok: true,
    data: normalizeSummary(
      data,
      {
        contentType:
          params.content_type,
        sourceItemId:
          params.source_item_id,
      }
    ),
  };
}