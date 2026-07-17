interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, color = "bg-brand-50 text-brand-600" }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
