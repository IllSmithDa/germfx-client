// src/lib/server/syncDrugUpdates.ts
import { SERVER_PATHS } from "@/config/paths";

export async function syncDrugUpdates(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const response = await fetch(SERVER_PATHS.syncOpenFda, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": process.env.INTERNAL_SYNC_TOKEN ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let detail = "Failed to sync FDA updates.";
      try {
        const data = await response.json();
        if (typeof data?.detail === "string") detail = data.detail;
      } catch {}
      return { ok: false, message: detail };
    }

    return { ok: true, message: "FDA updates synced successfully." };
  } catch {
    return { ok: false, message: "Failed to sync FDA updates." };
  }
}