import BookmarkTabs from "@/components/BookmarkTabs/BookmarkTabs";

type BookmarksPageProps = {
  searchParams?: Promise<{
    s_recall_page?: string;
    recall_query?: string;
    s_news_page?: string;
    news_query?: string;
    tab?: string;
    activeTab?: string;
    s_news_sort?: string;
    s_recall_sort?: string;
  }>;
};

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const resolved = (await searchParams) ?? {};
  const recallPage = Math.max(1, Number(resolved.s_recall_page ?? "1"));
  const recallQuery = resolved.recall_query?.trim() ?? "";

  const newsPage = Math.max(1, Number(resolved.s_news_page ?? "1"));
  const newsQuery = resolved.news_query?.trim() ?? "";

  const defaultTab =
    resolved.tab === "news" || resolved.tab === "recalls"
      ? resolved.tab
      : "news";

  const newsSort =
  resolved.s_news_sort === "oldest" ? "oldest" : "newest";

  const recallSort =
  resolved.s_recall_sort === "oldest" ? "oldest" : "newest";
  
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-10">
          <h1 className="text-2xl font-bold sm:text-3xl">Bookmarks</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Access saved recalls and saved news stories in one place.
          </p>

        <BookmarkTabs
          defaultTab={defaultTab}
          recallPage={recallPage}
          recallQuery={recallQuery}
          newsPage={newsPage}
          newsQuery={newsQuery}
          newsSort={newsSort}
          recallSort={recallSort}
        />
      </div>
    </div>
  );
}