import { fetchRecalls } from "@/lib/server/recallsApi";
import { getArticlesRequest } from "@/lib/server/articlesServerApi";
import {
  fetchBulkReactionSummaries,
  fetchBulkSavedChecks
} from "@/lib/server/bulkContentApi";
import ContentSearchTabs from "./ContentSearchTabs";

const PAGE_SIZE = 10;

type SearchType = "all" | "recalls" | "news";

export default async function SearchResults({
  query,
  type,
  page,
}: {
  query: string;
  type: SearchType;
  page: number;
}) {
  const skip = (page - 1) * PAGE_SIZE;

  const shouldFetchRecalls = query && (type === "all" || type === "recalls");
  const shouldFetchNews = query && (type === "all" || type === "news");

  const [recalls, news] = await Promise.all([
    shouldFetchRecalls
      ? fetchRecalls({
          query,
          limit: PAGE_SIZE,
          skip: type === "recalls" ? skip : 0,
          sync_if_needed: true,
        })
      : Promise.resolve(null),

    shouldFetchNews
      ? getArticlesRequest(type === "news" ? page : 1, PAGE_SIZE, query)
      : Promise.resolve(null),
  ]);

  const recallItems = recalls?.items ?? [];
  const newsItems = news?.items ?? [];

  const recallIds = recallItems.map((item) => item.id);
  const newsIds = newsItems.map((item) => item.id);

  const [recallReactionMap, newsReactionMap, recallSavedMap, newsSavedMap] =
  await Promise.all([
    recallIds.length
      ? fetchBulkReactionSummaries("recall", recallIds)
      : Promise.resolve({}),
    newsIds.length
      ? fetchBulkReactionSummaries("news", newsIds)
      : Promise.resolve({}),
    recallIds.length
      ? fetchBulkSavedChecks("recall", recallIds)
      : Promise.resolve({}),
    newsIds.length
      ? fetchBulkSavedChecks("news", newsIds)
      : Promise.resolve({}),
  ]);

  const total =
    type === "recalls"
      ? recalls?.total ?? 0
      : type === "news"
        ? news?.total ?? 0
        : recallItems.length + newsItems.length;

  const totalPages =
    type === "recalls"
      ? Math.max(1, Math.ceil((recalls?.total ?? 0) / PAGE_SIZE))
      : type === "news"
        ? Math.max(1, news?.total_pages ?? 1)
        : 1;

  return (
    <ContentSearchTabs
      query={query}
      type={type}
      page={page}
      total={total}
      totalPages={totalPages}
      recalls={recallItems}
      news={newsItems}
      recallReactionMap={recallReactionMap}
      newsReactionMap={newsReactionMap}
      recallSavedMap={recallSavedMap}
      newsSavedMap={newsSavedMap}
    />
  );
}