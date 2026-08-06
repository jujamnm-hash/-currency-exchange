"use client";

export type ChartNode = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  tone?: "root" | "mid" | "leaf";
  children: ChartNode[];
};

function toneClasses(tone: ChartNode["tone"] = "leaf") {
  if (tone === "root") {
    return "border-brand-600 bg-gradient-to-br from-brand-700 to-brand-800 text-white shadow-lg shadow-brand-200/50";
  }
  if (tone === "mid") {
    return "border-brand-300 bg-gradient-to-b from-white to-brand-50/80 text-slate-900";
  }
  return "border-slate-200 bg-white text-slate-900";
}

function NodeBox({ node }: { node: ChartNode }) {
  const isRoot = node.tone === "root";
  return (
    <div
      className={`org-node relative inline-block w-[168px] rounded-2xl border-2 px-3 py-3 text-center shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl ${toneClasses(node.tone)}`}
    >
      {node.badge && (
        <span
          className={`mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
            isRoot ? "bg-white/20 text-white" : "bg-brand-100 text-brand-800"
          }`}
        >
          {node.badge}
        </span>
      )}
      <p className={`text-sm font-bold leading-snug ${isRoot ? "text-white" : "text-slate-900"}`}>
        {node.title}
      </p>
      {node.subtitle && (
        <p className={`mt-1 text-[11px] font-semibold ${isRoot ? "text-teal-100" : "text-brand-700"}`}>
          {node.subtitle}
        </p>
      )}
      {node.meta && (
        <p className={`mt-1 text-[10px] leading-relaxed ${isRoot ? "text-white/65" : "text-slate-500"}`}>
          {node.meta}
        </p>
      )}
    </div>
  );
}

function TreeNode({ node }: { node: ChartNode }) {
  return (
    <li>
      <NodeBox node={node} />
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Visual top-down org chart with boxes and connector lines */
export function ShapeOrgChart({ roots }: { roots: ChartNode[] }) {
  if (!roots.length) return null;

  return (
    <div className="org-chart-wrap overflow-x-auto rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#f8fbfa_0%,#eef5f3_100%)] py-8">
      <div className="org-chart inline-block min-w-full px-6">
        <ul className="org-chart-root">
          {roots.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </ul>
      </div>
    </div>
  );
}
