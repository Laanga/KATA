import { Panel } from '@/components/ui/Panel';
export function DistributionPanel({
  title,
  description,
  rows,
  total,
}: {
  title: string;
  description: string;
  rows: { label: string; count: number; color?: string }[];
  total: number;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="kata-title-section">{title}</h2>
      <p className="kata-copy mt-2 mb-6">{description}</p>
      {total === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Todavía no hay datos para este resumen.
        </p>
      ) : (
        <dl className="space-y-5">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex justify-between gap-4 text-sm mb-2">
                <dt>{row.label}</dt>
                <dd className="tabular-nums shrink-0">
                  {row.count}
                  <span className="text-[var(--text-tertiary)] ml-2">
                    {Math.round((row.count / total) * 100)} %
                  </span>
                </dd>
              </div>
              <div aria-hidden="true" className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / total) * 100}%`,
                    backgroundColor: row.color || 'var(--accent-primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}
