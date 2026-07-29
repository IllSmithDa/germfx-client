import AdminUsersPanel from "@/components/Admin/AdminUsersPanel/AdminUsersPanel";


export default function AdminUsersPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] px-4 py-8 text-[hsl(var(--foreground))]">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
            Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            User Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Suspend abusive users, restore suspended accounts, and review account status.
          </p>
        </div>

        <AdminUsersPanel />
      </section>
    </main>
  );
}