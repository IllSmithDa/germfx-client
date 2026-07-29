// src/components/BookmarkTabs/BookmarkTabContent.tsx

import { fetchSavedItems } from "@/lib/server/fetchSavedItems";
import SavedNews from "@/components/SavedItems/SavedNews";
import SavedRecalls from "@/components/SavedItems/SavedRecalls";
import { SavedItemsSort } from "@/types";

const PAGE_SIZE = 12;

export default async function BookmarkTabContent({
  activeTab,
  recallPage,
  recallQuery,
  newsPage,
  newsQuery,
  newsSort,
  recallSort,
}: {
  activeTab: "recalls" | "news";
  recallPage: number;
  recallQuery: string;
  newsPage: number;
  newsQuery: string;
  newsSort: SavedItemsSort;
  recallSort: SavedItemsSort;
}) {
  if (activeTab === "news") {
    const news = await fetchSavedItems({
      content_type: "news",
      query: newsQuery || undefined,
      sort: newsSort,
      limit: PAGE_SIZE,
      skip: (newsPage - 1) * PAGE_SIZE,
    });
    // console.log("BookmarkTabContent news sort: ", newsSort);

    return (
      <SavedNews
        news={news}
        currentPage={newsPage}
        query={newsQuery}
        recallQuery={recallQuery}
        pageSize={PAGE_SIZE}
        sort={newsSort}
        recallSort={recallSort}
        baseUrl="/bookmarks"

      />
    );
  }

  const recalls = await fetchSavedItems({
    content_type: "recall",
    query: recallQuery || undefined,
    limit: PAGE_SIZE,
    skip: (recallPage - 1) * PAGE_SIZE,
    sort: recallSort,
  });

  return (
    <SavedRecalls
      recalls={recalls}
      currentPage={recallPage}
      query={recallQuery}
      newsQuery={newsQuery}
      pageSize={PAGE_SIZE}
      sort={recallSort}
      newsSort={newsSort}
      baseUrl="/bookmarks"
    />
  );
}