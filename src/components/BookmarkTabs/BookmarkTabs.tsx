
import { Suspense } from "react";
import SharedTabs, {
  type SharedTabItem,
} from "@/components/SharedTabs/SharedTabs";
import { BookmarksTabPanelSkeleton } from "@/app/(protected)/bookmarks/BookmarksPageSkeleton";
import BookmarkTabContent from "./BookmarkTabContent";
import { SavedItemsSort } from "@/types";

export type BookmarkTabId = "news" | "recalls";


function buildBookmarkHref(tab: BookmarkTabId) {
  return `/bookmarks?tab=${tab}`;
}
export default function BookmarkTabs({
  defaultTab,
  recallPage,
  recallQuery,
  newsPage,
  newsQuery,
  newsSort,
  recallSort,
}: {
  defaultTab: BookmarkTabId;
  recallPage: number;
  recallQuery: string;
  newsPage: number;
  newsQuery: string;
  newsSort: SavedItemsSort;
  recallSort: SavedItemsSort;
}) {
  
  const tabs: SharedTabItem<BookmarkTabId>[] = [
    {
      id: "news",
      label: "Saved News",
      href: buildBookmarkHref("news"),
    },
    {
      id: "recalls",
      label: "Saved Recalls",
      href: buildBookmarkHref("recalls"),
    },
  ];

  return (
    <div className="space-y-5">
      <SharedTabs
        tabs={tabs}
        activeTab={defaultTab}
        ariaLabel="Bookmark tabs"
      />

      <Suspense
        key={`${defaultTab}-${recallPage}-${recallQuery}-${newsPage}-${newsQuery}`}
        fallback={<BookmarksTabPanelSkeleton rows={6} />}
      >
        <BookmarkTabContent
          activeTab={defaultTab}
          recallPage={recallPage}
          recallQuery={recallQuery}
          newsPage={newsPage}
          newsQuery={newsQuery}
          newsSort={newsSort}
          recallSort={recallSort}
        />
      </Suspense>
    </div>
  );
}