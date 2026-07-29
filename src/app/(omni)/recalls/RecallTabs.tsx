"use client";

import SharedTabs from "@/components/SharedTabs/SharedTabs";
import { Bookmark, ListChecks } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type RecallView = "all" | "saved";

export default function RecallTabs({
  view = "all",
}: {
  view?: RecallView;
  query?: string;
  source?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setView(nextView: RecallView) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("view", nextView);

    params.set("page", "1");

    const qs = params.toString();
    router.push(`/recalls${qs ? `?${qs}` : ""}`);
  }
  return (
    <div className="flex justify-start m-0">
        <SharedTabs
          tabs={[
            { id: "all", label: "All Recalls", icon: <ListChecks size={15} /> },
            { id: "saved", label: "Saved Recalls", icon: <Bookmark size={15} /> },
          ]}
          activeTab={view}
          onChange={setView}
          ariaLabel="Recall views"
        />
    </div>
  );
}