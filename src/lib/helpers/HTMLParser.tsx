"use client";

type ParsedTable = {
  caption?: string;
  headers: string[];
  rows: string[][];
};

function parseHtmlTable(html: string): ParsedTable | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;

  const caption = table.querySelector("caption")?.textContent?.trim();

  const trs = Array.from(table.querySelectorAll("tr"));
  if (!trs.length) return { caption, headers: [], rows: [] };

  // headers from first row (th or td)
  const firstCells = Array.from(trs[0].querySelectorAll("th,td"));
  const headers = firstCells.map((c) => (c.textContent ?? "").trim()).filter(Boolean);

  // remaining rows
  const rows = trs.slice(1).map((tr) => {
    const cells = Array.from(tr.querySelectorAll("th,td"));
    return cells.map((c) => (c.textContent ?? "").trim());
  });

  return { caption, headers, rows };
}


export function ParsedAdverseTables({ tables }: { tables?: string[] }) {
  if (!tables?.length) return null;

  const parsed = tables
    .map(parseHtmlTable)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-6">
      {parsed.map((t, idx) => (
        <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {t.caption ? <div className="mb-3 text-sm font-medium">{t.caption}</div> : null}

          <div className="overflow-auto">
            <table className="min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {t.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, r) => (
                  <tr key={r} className="border-b border-[hsl(var(--border))] last:border-0">
                    {row.map((cell, c) => (
                      <td key={c} className="px-3 py-2 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
