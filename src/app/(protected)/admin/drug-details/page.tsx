import Link from "next/link";

import { CLIENT_PATHS } from "@/config/paths";
import DrugDetailResyncPanel from "./DrugDetailResyncPanel";

export default function AdminDrugDetailsPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link
            href={CLIENT_PATHS.adminHomePath()}
            className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
          >
            ← Admin
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Drug Detail Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Review saved drug detail records, open admin detail views, and force-refresh records from OpenFDA for cleanup and testing.
          </p>
        </div>

        <DrugDetailResyncPanel />
      </section>
    </main>
  );
}