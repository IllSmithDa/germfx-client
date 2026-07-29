/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import SharedTabs from "@/components/SharedTabs/SharedTabs";
import { SavedItemsSort } from "@/types";
import { NewsSort } from "@/types/news";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewsTabs({
  view,
}: {
  view: "all" | "saved";
  query: string;
  sort: NewsSort | SavedItemsSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams()
  
  function setView(nextView: "all" | "saved") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    params.set("page", "1");
    router.push(`/news?${params.toString()}`);
  }


  return (
    <div className="space-y-4">
      <SharedTabs
        tabs={[
          { id: "all", label: "All News" },
          { id: "saved", label: "Saved News" },
        ]}
        activeTab={view}
        onChange={setView}
        ariaLabel="News views"
      />
    </div>
  );
}