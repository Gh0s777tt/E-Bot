import type { ReactNode } from 'react';

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${accent ? 'border-accent/40 bg-accent/10 shadow-glow-sm' : 'border-line bg-card'}`}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
