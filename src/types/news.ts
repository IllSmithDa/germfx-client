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
export type NewsSort = "latest" | "popular" | "oldest";