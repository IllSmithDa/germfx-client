import { AdminDrugIndexKind, AdminDrugIndexSort } from "@/types/admin";

export default function AdminDrugIndexSearchBar({
  sort,
  kind,
  defaultValue = "",
}: {
  sort: AdminDrugIndexSort;
  kind?: AdminDrugIndexKind;
  defaultValue?: string;
}) {
  return (
    <form
      action="/admin/drug-index-codes/search"
      method="GET"
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
    >
      <input
        type="hidden"
        name="sort"
        value={sort}
      />

      {kind && (
        <input
          type="hidden"
          name="kind"
          value={kind}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">
            Search drug indexes
          </span>

          <input
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder="Search drug index by name or manufacturer..."
            className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </label>

        <button
          type="submit"
          className="h-11 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
}