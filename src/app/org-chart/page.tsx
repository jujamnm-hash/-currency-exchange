"use client";

import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ShapeOrgChart, type ChartNode } from "@/components/ShapeOrgChart";
import { api } from "@/lib/api-client";
import { buildDepartmentTree } from "@/lib/utils";
import { Users, Network, ZoomIn, ZoomOut } from "lucide-react";

interface OrgNode {
  id: string;
  name: string;
  phone?: string | null;
  employeeCode?: string | null;
  markets?: { name: string }[];
  market?: { name: string } | null;
  marketNames?: string;
  department?: { name: string } | null;
  position?: { name: string; level?: number } | null;
  children: OrgNode[];
}

interface Department {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
}

type ViewMode = "employees" | "departments";

function mapEmployeeTree(nodes: OrgNode[], depth = 0): ChartNode[] {
  return nodes.map((n) => {
    const marketText =
      n.marketNames ||
      n.markets?.map((m) => m.name).join(" · ") ||
      n.market?.name ||
      "";
    return {
      id: n.id,
      title: n.name,
      subtitle: n.position?.name || "بێ پۆست",
      meta: [n.department?.name, marketText, n.employeeCode].filter(Boolean).join(" · "),
      badge: typeof n.position?.level === "number" ? `L${n.position.level}` : undefined,
      tone: depth === 0 ? "root" : n.children.length ? "mid" : "leaf",
      children: mapEmployeeTree(n.children, depth + 1),
    };
  });
}

function mapDepartmentTree(
  nodes: Array<Department & { children: Array<Department & { children: unknown[] }> }>,
  depth = 0
): ChartNode[] {
  return nodes.map((d) => ({
    id: d.id,
    title: d.name,
    subtitle: d.code || "بەشی ئیداری",
    meta: d.description || undefined,
    badge: depth === 0 ? "سەرەکی" : `ئاست ${depth + 1}`,
    tone: depth === 0 ? "root" : d.children.length ? "mid" : "leaf",
    children: mapDepartmentTree(
      d.children as Array<Department & { children: Array<Department & { children: unknown[] }> }>,
      depth + 1
    ),
  }));
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>("employees");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    Promise.all([api.orgChart(), api.departments()])
      .then(([org, deps]) => {
        setTree(org.tree as OrgNode[]);
        setDepartments(deps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const employeeChart = useMemo(() => mapEmployeeTree(tree), [tree]);
  const departmentChart = useMemo(
    () => mapDepartmentTree(buildDepartmentTree(departments)),
    [departments]
  );

  const roots = mode === "employees" ? employeeChart : departmentChart;
  const emptyMessage =
    mode === "employees"
      ? "هێشتا کارمەند یان پەیوەندی سەرپەرشتیاری زیاد نەکراوە"
      : "هێشتا بەشی ئیداری زیاد نەکراوە";

  return (
    <PageLayout
      title="نەخشەی هەیکەل"
      subtitle="چارت و شەیپی هەیکەلی ئیداری و کارمەندان"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary !px-2.5 !py-2"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
            title="بچووککردنەوە"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="btn-secondary !px-2.5 !py-2"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
            title="گەورەکردن"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      }
    >
      <div className="mb-4 flex gap-2 rounded-2xl bg-white/80 p-1.5 shadow-sm border border-slate-100">
        <button
          type="button"
          onClick={() => setMode("employees")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "employees" ? "bg-brand-700 text-white shadow" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users size={16} />
          هەیکەلی کارمەندان
        </button>
        <button
          type="button"
          onClick={() => setMode("departments")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "departments" ? "bg-brand-700 text-white shadow" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Network size={16} />
          هەیکەلی ئیداری
        </button>
      </div>

      {loading ? (
        <div className="card h-56 animate-pulse bg-slate-100" />
      ) : roots.length ? (
        <div className="overflow-x-auto">
          <div
            className="origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: `${100 / zoom}%` }}
          >
            <ShapeOrgChart roots={roots} />
          </div>
        </div>
      ) : (
        <div className="card text-center text-sm text-slate-400">{emptyMessage}</div>
      )}

      <p className="mt-3 text-center text-xs text-slate-400">
        بۆکسەکان = پۆست/بەش · هێڵەکان = پەیوەندی سەرپەرشتیاری یان ژێربەش
      </p>
    </PageLayout>
  );
}
