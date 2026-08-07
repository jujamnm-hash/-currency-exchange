interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({
  title,
  value,
  icon,
  color = "bg-brand-50 text-brand-700",
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        {icon && <div className={`rounded-lg p-1.5 ${color}`}>{icon}</div>}
      </div>
      <p className="text-xl font-bold text-slate-900 md:text-2xl">{value}</p>
    </div>
  );
}
