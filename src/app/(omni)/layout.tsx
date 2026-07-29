import Footer from '@/components/Footer/Footer';
import NavbarAuth from '@/components/Navbar/NavbarAuth';
import NavbarNoAuth from '@/components/Navbar/NavbarNoAuth';
import { getSessionUser } from '@/lib/helpers/auth';
import React, { ReactNode } from 'react'

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
    const user = await getSessionUser();
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
