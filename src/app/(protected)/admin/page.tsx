import Link from "next/link";
import { CLIENT_PATHS } from "@/config/paths";

type AdminOption = {
  title: string;
  description: string;
  href: string;
  status?: "ready" | "soon";
};

const adminOptions: AdminOption[] = [
  {
    title: "Drug index UPC/NDC codes",
    description:
      "Add curated UPC or NDC codes to existing drug index records so barcode scanning becomes more reliable.",
    href: CLIENT_PATHS.adminDrugIndexCodesPath(),
    status: "ready",
  },
  {
    title: "User management",
    description:
      "Manage admin roles, suspend abusive accounts, and restore suspended users.",
    href: CLIENT_PATHS.adminUsersPath(),
    status: "ready",
  },
  {
    title: "Drug detail management",
    description:
      "Review saved drug details, inspect admin detail records, and force-resync OpenFDA data.",
    href: CLIENT_PATHS.adminDrugDetailsPath(),
    status: "ready",
  },
  {
    title: "User feedback",
    description:
      "Review submitted feedback, mark items as read or addressed, and delete feedback that no longer needs to be stored.",
    href: CLIENT_PATHS.adminFeedbackPath(),
    status: "ready",
  },
];

function AdminOptionCard({
  option,
}: {
  option: AdminOption;
}) {
  const disabled = option.status === "soon";

  const content = (
    <div
      className={[
        "h-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition",
        disabled
          ? "opacity-60"
          : "hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">
          {option.title}
        </h2>

        <span
          className={[
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            option.status === "ready"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
          ].join(" ")}
        >
          {option.status === "ready"
            ? "Ready"
            : "Soon"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {option.description}
      </p>
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={option.href}>
      {content}
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
            Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            SideFX Admin
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Manage curated medication data, barcode mappings, and internal tools.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminOptions.map((option) => (
            <AdminOptionCard
              key={option.href}
              option={option}
            />
          ))}
        </div>
      </section>
    </main>
  );
}