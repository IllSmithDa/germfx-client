"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  userId: number | string;
  days: number;
  topSymptomLimit: number;
  limitReached?: boolean;
};

type ApiErrorPayload = {
  detail?:
    | string
    | {
        message?: string;
        code?: string;
      };
  message?: string;
};

function getErrorMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload) return fallback;

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (
    payload.detail &&
    typeof payload.detail === "object" &&
    typeof payload.detail.message === "string"
  ) {
    return payload.detail.message;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function getDownloadFilename(
  contentDisposition: string | null,
  fallback: string,
) {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
    } catch {
      return utf8Match[1].replace(/["']/g, "");
    }
  }

  const filenameMatch = contentDisposition.match(
    /filename="?([^";]+)"?/i,
  );

  return filenameMatch?.[1]?.trim() || fallback;
}

export default function DownloadReportPdfButton({
  userId,
  days,
  topSymptomLimit,
  limitReached = false,
}: Props) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (isDownloading || limitReached) return;

    setIsDownloading(true);
    setError(null);

    const searchParams = new URLSearchParams({
      days: String(days),
      top_symptom_limit: String(topSymptomLimit),
    });

    const url =
      `/api/reports/${encodeURIComponent(String(userId))}` +
      `/export/pdf?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/pdf, application/json",
        },
      });

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload = (await response.json()) as ApiErrorPayload;
        } catch {}

        if (response.status === 401) {
          throw new Error(
            getErrorMessage(
              payload,
              "Your session has expired. Please sign in again.",
            ),
          );
        }

        throw new Error(
          getErrorMessage(
            payload,
            "Unable to download the PDF report.",
          ),
        );
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const filename = getDownloadFilename(
        response.headers.get("content-disposition"),
        "GermFx-report.pdf",
      );

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1_000);

      router.refresh();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download the PDF report.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading || limitReached}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading ? (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
            <path
              d="M8 2a6 6 0 0 1 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path
              d="M8 2.5v7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 7.5 8 10l2.5-2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 12.5h10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {isDownloading
          ? "Preparing PDF…"
          : limitReached
            ? "PDF limit reached"
            : "Download PDF"}
      </button>

      {error ? (
        <p
          role="alert"
          className="max-w-sm text-xs text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}