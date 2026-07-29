// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import NavbarAuth from "@/components/Navbar/NavbarAuth";
import { UserProvider } from "@/lib/UserContext";
import Footer from "@/components/Footer/Footer";
import { getSessionUser } from "@/lib/server/getSessionUserCached";

async function currentPathFromHeaders() {
  const h = await headers();
  const pathname = h.get("next-url") || "/";
  return pathname;
}


export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
   const next = encodeURIComponent(await currentPathFromHeaders());
    redirect(`/login?next=${next}`);
  }
  
  return (
    <UserProvider user={user}>
      <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <NavbarAuth user={user} />
        {children}
        <Footer />
      </div>
    </UserProvider>
  );
}
