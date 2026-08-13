import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen atmosphere">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>
    </div>
  );
}
