import Link from "next/link";

import type { NewsArticle } from "@/lib/server/articlesServerApi";
import ContentSearchBar from "../ContentSearchBar/ContentSearchBar";
import type {
  ReactionSummaryMap,
  SavedCheckMap,
} from "@/lib/server/bulkContentApi";
import { CLIENT_PATHS } from "@/config/paths";
import NewsListView from "../NewsListView/NewsListView";

type Props = {
  articles: NewsArticle[];
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  userId?: number | string | null;
};

export default function NewsPanel({
  articles,
  savedMap,
  reactionMap,
  userId,
}: Props) {
  return (
    <section className="overflow-visible border-0 bg-transparent shadow-none sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3 border-b-0 p-0 sm:mb-0 sm:border-b sm:border-[hsl(var(--border))] sm:p-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-lg sm:leading-6">
            News
          </h2>
          <p className="mt-1 hidden text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:block">
            Recent medication, recall, and health-related stories.
          </p>
        </div>

        <Link
          href={CLIENT_PATHS.newsPage(1)}
          className="inline-flex min-h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-[11px] font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:min-h-9 sm:px-3 sm:text-xs"
        >
          More News
        </Link>
      </div>

      <div className="px-0 py-0 sm:px-5 sm:py-4">
        <div className="mb-4 hidden sm:block">
          <ContentSearchBar
            type="news"
            placeholder="Search health news..."
          />
        </div>

        <NewsListView
          articles={articles}
          savedMap={savedMap}
          reactionMap={reactionMap}
          userId={userId}
        />
      </div>

      {articles.length > 0 ? (
        <div className="mt-3 border-t-0 px-0 py-0 sm:mt-0 sm:border-t sm:border-[hsl(var(--border))] sm:px-5 sm:py-5">
          <div className="flex justify-center">
            <Link
              href={CLIENT_PATHS.newsPage(2)}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:w-auto dark:text-violet-400"
            >
              More News
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}