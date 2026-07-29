import Link from "next/link";
import { notFound } from "next/navigation";

import { CLIENT_PATHS } from "@/config/paths";
import AdminDrugDetailReadPanel from "./AdminDrugDetailReadPanel";

type PageProps = {
  params: Promise<{
    detailId: string;
  }>;
};

export default async function AdminDrugDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const detailId = Number(resolvedParams.detailId);

  if (!Number.isInteger(detailId) || detailId <= 0) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link
            href={CLIENT_PATHS.adminDrugDetailsPath()}
            className="text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
          >
            ← Drug detail management
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Admin Drug Detail
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Inspect the saved admin version of this drug detail record and review the payload returned by the backend admin detail route.
          </p>
        </div>

        <AdminDrugDetailReadPanel detailId={detailId} />
      </section>
    </main>
  );
}