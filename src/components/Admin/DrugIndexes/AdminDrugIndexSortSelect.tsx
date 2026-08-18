"use client";

import { AdminDrugIndexSort } from "@/types/admin";
import { usePathname, useRouter, useSearchParams } from "next/navigation";



const SORT_OPTIONS: {
  value: AdminDrugIndexSort;
  label: string;
}[] = [
  {
    value: "updated_asc",
    label: "Oldest updated",
  },
  {
    value: "created_asc",
    label: "Oldest created",
  },
  {
    value: "updated_desc",
    label: "Newest updated",
  },
  {
    value: "created_desc",
    label: "Newest created",
  },
  {
    value: "name_asc",
    label: "Name A-Z",
  },
  {
    value: "name_desc",
    label: "Name Z-A",
  },
];

export default function AdminDrugIndexSortSelect({
  value,
}: {
  value: AdminDrugIndexSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const nextSort = event.target.value;

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("sort", nextSort);
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-[hsl(var(--muted-foreground))]">
        Sort
      </span>

      <select
        value={value}
        onChange={handleChange}
        className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-3 text-sm font-medium text-[hsl(var(--foreground))] outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}