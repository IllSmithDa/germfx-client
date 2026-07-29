// app/(public)/layout.tsx
import Footer from '@/components/Footer/Footer';
import NavbarAuth from '@/components/Navbar/NavbarAuth';
import NavbarNoAuth from '@/components/Navbar/NavbarNoAuth';
import { getSessionUser } from '@/lib/helpers/auth';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (user?.id) {
    redirect("/home");
  }
  return (
    <main>
      {
        user?.id ? <NavbarAuth user={user} /> : <NavbarNoAuth />
      }
      {children}
      <Footer />
    </main>
  );
}