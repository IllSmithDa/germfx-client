import { SERVER_PATHS } from "@/config/paths";
import { NewsSort } from "@/types/news";

export type NewsArticle = {
  id: number;
  source: string;
  topic: string;
  external_id: string;
  title: string;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  related_drug_name: string | null;
  matched_display_name: string | null;
};

export type ArticlesResponse = {
  items: NewsArticle[];
  count: number;
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  meta?: {
    message?: string | null;
  };
};

export async function getArticlesRequest(
  page = 1,
  pageSize = 10,
  query?: string,
  sort: NewsSort = "latest"
): Promise<ArticlesResponse> {
  const response = await fetch(
    SERVER_PATHS.articles(page, pageSize, query, sort),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      count: 0,
      items: [],
      total: 0,
      page,
      page_size: pageSize,
      total_pages: 1,
    };
  }

  return response.json();
}