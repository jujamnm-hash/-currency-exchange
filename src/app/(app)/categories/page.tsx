import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { deleteCategory, saveCategory } from "@/app/actions/business";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await ensureSchema();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">پۆلەکان</h1>
        <p className="mt-1 text-ink-soft">پۆلکردن و ڕێکخستنی کاڵاکان</p>
      </div>

      <form action={saveCategory} className="panel flex flex-wrap gap-3 p-5">
        <input name="name" className="input max-w-sm" placeholder="ناوی پۆل" required />
        <button type="submit" className="btn-primary">
          زیادکردن
        </button>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ناو</th>
              <th>ژمارەی کاڵا</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c._count.products}</td>
                <td>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-sm text-[var(--rose)]">
                      سڕینەوە
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
