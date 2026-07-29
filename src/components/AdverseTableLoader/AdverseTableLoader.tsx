// components/AdverseTableLoader.tsx
"use client";

import dynamic from "next/dynamic";

type Props = {
  tables?: string[];
};

const BrowserOnlyComponent = dynamic<Props>(
  () => import("@/lib/helpers/HTMLParser").then((m) => m.ParsedAdverseTables),
  {
    ssr: false, // DOMParser only exists in the browser
    loading: () => <p>Loading...</p>,
  }
);

export default function AdverseTableLoader({ tables }: Props) {
  return <BrowserOnlyComponent tables={tables} />;
}
