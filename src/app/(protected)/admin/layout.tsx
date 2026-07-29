import Link from "next/link";
import { getAdminStatus } from "@/lib/server/getAdminStatus";

function AdminAccessDenied({
  message,
}: {
  message: string;
}) {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-12 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <span className="text-xl font-black">!</span>
        </div>

        <h1 className="text-2xl font-bold">
          Admin access required
        </h1>

        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
          >
            Go home
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))]"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminStatus();

  if (!admin.ok) {

    return (
      <>
        <AdminAccessDenied
          message={admin.message}
        />
      </>
    );
  }

  return children;
}