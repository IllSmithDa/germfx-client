
import { getSessionUser } from '@/lib/server/getSessionUserCached';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react';

export default async function RegisterLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  // If user is already logged in → block access to public pages
  if (user?.id) {
    redirect("/home");
  }

  return (
    <>
      {children}
    </>
  );
}