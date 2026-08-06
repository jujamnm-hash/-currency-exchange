"use client";

import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ShapeOrgChart, type ChartNode } from "@/components/ShapeOrgChart";
import { api } from "@/lib/api-client";
import { buildDepartmentTree } from "@/lib/utils";
import {
  Users,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitBranch,
  Layers,
} from "lucide-react";

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

function countNodes(nodes: ChartNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

function maxDepth(nodes: ChartNode[], d = 1): number {
  if (!nodes.length) return d - 1;
  return Math.max(...nodes.map((n) => maxDepth(n.children, d + 1)), d);
}

function mapEmployeeTree(nodes: OrgNode[], depth = 0): ChartNode[] {
  return nodes.map((n) => {
    const markets =
      n.markets?.map((m) => m.name) ||
      (n.marketNames ? n.marketNames.split(" · ").filter(Boolean) : n.market?.name ? [n.market.name] : []);
    const level = n.position?.level;
    return {
      id: n.id,
      title: n.name,
      subtitle: n.position?.name || "بێ پۆست",
      meta: [n.department?.name, markets.join(" · "), n.employeeCode].filter(Boolean).join(" · "),
      badge: typeof level === "number" ? `L${level}` : undefined,
      level,
      tone: depth === 0 ? "root" : n.children.length ? "mid" : "leaf",
      phone: n.phone || undefined,
      code: n.employeeCode || undefined,
      markets,
      department: n.department?.name,
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
    level: Math.max(1, 5 - depth),
    tone: depth === 0 ? "root" : d.children.length ? "mid" : "leaf",
    department: d.description || undefined,
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
  const [compact, setCompact] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.orgChart(), api.departments()])
      .then(([org, deps]) => {
        setTree(org.tree as OrgNode[]);
        setDepartments(deps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedId(null);
  }, [mode]);

  const employeeChart = useMemo(() => mapEmployeeTree(tree), [tree]);
  const departmentChart = useMemo(
    () => mapDepartmentTree(buildDepartmentTree(departments)),
    [departments]
  );

  const roots = mode === "employees" ? employeeChart : departmentChart;
  const total = countNodes(roots);
  const depth = maxDepth(roots);
  const emptyMessage =
    mode === "employees"
      ? "هێشتا کارمەند یان پەیوەندی سەرپەرشتیاری زیاد نەکراوە"
      : "هێشتا بەشی ئیداری زیاد نەکراوە";

  return (
    <PageLayout
      title="نەخشەی هەیکەل"
      subtitle="چارتێکی پرۆفیشنال و ڕوونی هەیکەلی کارمەندان و ئیدارە"
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn-secondary !px-2.5 !py-2"
            onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(1))))}
            title="بچووککردنەوە"
          >
            <ZoomOut size={16} />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-bold text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="btn-secondary !px-2.5 !py-2"
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            title="گەورەکردن"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="btn-secondary !px-2.5 !py-2"
            onClick={() => setZoom(1)}
            title="قەبارەی ئاسایی"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <div className="card !p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Users size={13} /> کۆی یەکەکان
          </div>
          <p className="text-xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="card !p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Layers size={13} /> قووڵایی هەیکەل
          </div>
          <p className="text-xl font-bold text-slate-900">{depth || 0}</p>
        </div>
        <div className="card !p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <GitBranch size={13} /> سەرەکی
          </div>
          <p className="text-xl font-bold text-slate-900">{roots.length}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 rounded-2xl border border-slate-100 bg-white/80 p-1.5 shadow-sm">
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

        <button
          type="button"
          onClick={() => setCompact((v) => !v)}
          className={`btn-secondary whitespace-nowrap !py-2.5 text-xs ${compact ? "!bg-brand-50 !text-brand-800" : ""}`}
        >
          {compact ? "دیمەنی تەواو" : "دیمەنی کورت"}
        </button>
      </div>

      {loading ? (
        <div className="card h-72 animate-pulse bg-slate-100" />
      ) : roots.length ? (
        <div className="overflow-x-auto rounded-3xl">
          <div
            className="origin-top transition-transform duration-300"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: `${100 / zoom}%`,
            }}
          >
            <ShapeOrgChart
              roots={roots}
              compact={compact}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      ) : (
        <div className="card text-center text-sm text-slate-400">{emptyMessage}</div>
      )}

      <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
        کلیک لەسەر کارت بکە بۆ وردەکاری · دوگمەی خوارەوە بۆ کردنەوە/داخستنی تیم · ڕەنگەکان = ئاستی پۆست
      </p>
    </PageLayout>
  );
}
