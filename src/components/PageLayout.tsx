interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function PageLayout({ title, subtitle, children, action }: PageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl md:flex">
      <div className="flex-1 px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
