import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { saveSettings } from "@/app/actions/business";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await ensureSchema();
  const settings = await prisma.companySettings.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">ڕێکخستن</h1>
        <p className="mt-1 text-ink-soft">زانیاری کۆمپانیا و دراو</p>
      </div>

      <form action={saveSettings} className="panel grid max-w-2xl gap-4 p-5">
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">ناوی کۆمپانیا</span>
          <input name="name" className="input" defaultValue={settings?.name ?? ""} required />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">مۆبایل</span>
          <input name="phone" className="input" defaultValue={settings?.phone ?? ""} />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">ناونیشان</span>
          <input name="address" className="input" defaultValue={settings?.address ?? ""} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-ink-muted">کۆدی دراو</span>
            <input name="currency" className="input" defaultValue={settings?.currency ?? "IQD"} />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-ink-muted">ناوی دراو</span>
            <input
              name="currencyLabel"
              className="input"
              defaultValue={settings?.currencyLabel ?? "دینار"}
            />
          </label>
        </div>
        <button type="submit" className="btn-primary w-fit">
          پاشەکەوتکردن
        </button>
      </form>

      <div className="panel max-w-2xl p-5 text-sm leading-7 text-ink-soft">
        <p className="font-medium text-ink">دامەزراندن لە Vercel</p>
        <ol className="mt-2 list-decimal pr-5">
          <li>پرۆژەکە ببەستە بە Vercel</li>
          <li>Storage → Postgres دروست بکە و DATABASE_URL زیاد بکە</li>
          <li>Deploy بکە — خشتەکان لە یەکەم کردنەوەدا خۆکار دروست دەبن</li>
          <li>
            پشکنین: <code className="rounded bg-teal-50 px-1">/api/health</code>
          </li>
        </ol>
      </div>
    </div>
  );
}
