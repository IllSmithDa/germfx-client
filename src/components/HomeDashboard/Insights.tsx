// components/dashboard/Insights.tsx
type Insight = { id: string; title: string; detail: string };

export function Insights({ items }: { items: Insight[] }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((i) => (
        <div
          key={i.id}
          className="rounded-md border border-slate-200 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
        >
          <div className="text-sm font-semibold text-slate-900">{i.title}</div>
          <div className="mt-1 text-sm text-slate-700">{i.detail}</div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="rounded-md border border-slate-200 p-6 text-center text-slate-500">
          No insights yet.
        </div>
      )}
    </div>
  );
}