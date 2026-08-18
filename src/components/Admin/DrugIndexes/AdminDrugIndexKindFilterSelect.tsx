"use client";

import { AdminDrugIndexKind } from "@/types/admin";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";


type KindFilterValue =
  | AdminDrugIndexKind
  | "all";

const FILTER_OPTIONS: {
  value: KindFilterValue;
  label: string;
}[] = [
  {
    value: "brand",
    label: "Brand only",
  },
  {
    value: "generic",
    label: "Generic only",
  },
  {
    value: "substance",
    label: "Substance only",
  },
  {
    value: "all",
    label: "All types",
  },
];

export default function AdminDrugIndexKindFilterSelect({
  value,
}: {
  value: KindFilterValue;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const nextKind =
      event.target.value as KindFilterValue;

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (nextKind === "all") {
      params.delete("kind");
    } else {
      params.set("kind", nextKind);
    }

    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-[hsl(var(--muted-foreground))]">
        Filter
      </span>

      <select
        value={value}
        onChange={handleChange}
        className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-3 text-sm font-medium text-[hsl(var(--foreground))] outline-none transition focus:ring-2 focus:ring-[hsl(var(--ring))]"
      >
        {FILTER_OPTIONS.map((option) => (
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