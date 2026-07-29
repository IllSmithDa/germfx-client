"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSavedItem } from "@/lib/client/savedItems";

export default function UnsaveButton({ savedItemId }: { savedItemId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          await deleteSavedItem(savedItemId);
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
    >
      {loading ? "Removing..." : "Unsave"}
    </button>
  );
}