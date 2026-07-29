// components/ui/ShowMoreList.tsx
"use client";

import { useState } from "react";

type Props = {
  head: string[];
  tail: string[];
  className?: string;
  itemClassName?: string;
  label?: string; // e.g., "Show"
};

export default function ShowMoreList({
  head,
  tail,
  className = "",
  itemClassName = "",
  label = "Show",
}: Props) {
  const [open, setOpen] = useState(false);
  const totalExtra = tail.length;

  return (
    <div className={className}>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {head.map((line, i) => (
          <li key={`head-${i}`} dangerouslySetInnerHTML={{ __html: line }} className={itemClassName} />
        ))}
        {open &&
          tail.map((line, i) => (
            <li key={`tail-${i}`} dangerouslySetInnerHTML={{ __html: line }} className={itemClassName} />
          ))}
      </ul>

      {totalExtra > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-xs text-[hsl(var(--primary))] hover:underline rounded px-1 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          aria-expanded={open}
        >
          {open ? "Hide" : `${label} ${totalExtra} more`}
        </button>
      )}
    </div>
  );
}
