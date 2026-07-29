// src/components/ExportDrugDetailButton/ExportDrugDetailButton.tsx

"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CLIENT_PATHS } from "@/config/paths";
import { fetchWithClientRefresh } from "@/lib/client/clientRefresh";

type ExportDrugDetailButtonProps = {
  drugDetailId: number;
  userId?: number | string | null;
  className?: string;
};

async function getDownloadErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return "Failed to generate PDF.";
  }

  try {
    const data = await response.json();

    const detail = data?.detail;

    if (
      detail &&
      typeof detail === "object" &&
      detail.code === "FREE_LIMIT_REACHED"
    ) {
      return (
        detail.message ??
        "You have reached your free PDF download limit."
      );
    }

    if (
      detail &&
      typeof detail === "object" &&
      typeof detail.message === "string"
    ) {
      return detail.message;
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    return "Failed to generate PDF.";
  } catch {
    return "Failed to generate PDF.";
  }
}

function hasValidUserId(userId?: number | string | null) {
  if (userId === null || userId === undefined) {
    return false;
  }

  return String(userId).trim().length > 0;
}

export default function ExportDrugDetailButton({
  drugDetailId,
  userId = null,
  className = "",
}: ExportDrugDetailButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthenticated = hasValidUserId(userId);

  function redirectToLogin() {
    const queryString = searchParams.toString();
    const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(
      `${CLIENT_PATHS.clientLoginPath()}?next=${encodeURIComponent(nextPath)}`,
    );
  }

  async function handleDownload() {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      setDownloading(true);
      setError(null);

      const fetchURL = CLIENT_PATHS.pdfDrugDetailsProxy(drugDetailId);

      const response = await fetchWithClientRefresh(fetchURL, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(await getDownloadErrorMessage(response));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const disposition = response.headers.get("Content-Disposition");

      let filename = `drug-detail-${drugDetailId}.pdf`;

      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);

        if (match?.[1]) {
          filename = match[1];
        }
      }

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-4">
      
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        title={isAuthenticated ? undefined : "Log in to download this PDF"}
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))]",
          "bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium",
          "text-[hsl(var(--foreground))] shadow-sm transition-colors",
          "hover:bg-[hsl(var(--muted))]",
          "disabled:cursor-not-allowed disabled:opacity-60",  
          className,
        ].join(" ")}
      >
        <Download className="h-4 w-4" />

        {downloading ? "Generating PDF..." : "Download PDF"}
      </button>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}