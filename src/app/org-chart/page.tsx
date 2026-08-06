"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { api } from "@/lib/api-client";

interface OrgNode {
  id: string;
  name: string;
  phone?: string | null;
  employeeCode?: string | null;
  market?: { name: string } | null;
  department?: { name: string } | null;
  position?: { name: string; level?: number } | null;
  children: OrgNode[];
}

function OrgCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  return (
    <div className="relative">
      <div
        className="rounded-2xl border border-brand-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        style={{ marginInlineStart: Math.min(depth, 4) * 12 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900">{node.name}</p>
            <p className="mt-0.5 text-xs font-medium text-brand-700">
              {node.position?.name || "بێ پۆست"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {[node.department?.name, node.market?.name, node.employeeCode].filter(Boolean).join(" · ")}
            </p>
          </div>
          {typeof node.position?.level === "number" && (
            <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800">
              L{node.position.level}
            </span>
          )}
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2 border-r-2 border-brand-100 pr-3 mr-3">
          {node.children.map((child) => (
            <OrgCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .orgChart()
      .then((data) => setTree(data.tree as OrgNode[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout title="ڕێکخستنی کارمەندان" subtitle="نەخشەی هەیکەلی سەرپەرشتیاری و کارمەندان">
      {loading ? (
        <div className="card h-40 animate-pulse bg-slate-100" />
      ) : tree.length ? (
        <div className="space-y-4">
          {tree.map((node) => (
            <OrgCard key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <div className="card text-center text-sm text-slate-400">
          هێشتا کارمەند یان پەیوەندی سەرپەرشتیاری زیاد نەکراوە
        </div>
      )}
    </PageLayout>
  );
}
