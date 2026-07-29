"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";
import { NewsSort } from "@/types/news";

const NEWS_SORT_OPTIONS: readonly SortSelectOption<NewsSort>[] = [
  { value: "latest", label: "Latest news" },
  { value: "popular", label: "Popular news" },
  { value: "oldest", label: "Oldest news" },
];

export default function NewsSortSelect({
  value = "latest",
}: {
  value?: NewsSort;
}) {
  return (
    <SortSelect<NewsSort>
      value={value}
      options={NEWS_SORT_OPTIONS}
      defaultValue="latest"
      basePath="/news"
      ariaLabel="Sort news"
      label="Sort news"
    />
  );
}