"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Phone, Store, Users } from "lucide-react";

export type ChartNode = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  tone?: "root" | "mid" | "leaf";
  level?: number;
  phone?: string;
  code?: string;
  markets?: string[];
  department?: string;
  children: ChartNode[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).slice(0, 2);
}

function levelTone(level?: number, tone?: ChartNode["tone"]) {
  if (tone === "root" || level === 5) {
    return {
      card: "border-brand-600/30 bg-gradient-to-br from-brand-800 via-brand-700 to-teal-700 text-white shadow-xl shadow-brand-900/20",
      avatar: "bg-white/20 text-white ring-2 ring-white/30",
      chip: "bg-white/15 text-white border-white/20",
      sub: "text-teal-100",
      meta: "text-white/70",
      line: "#0f766e",
    };
  }
  if (tone === "mid" || (level && level >= 3)) {
    return {
      card: "border-teal-200 bg-gradient-to-b from-white to-teal-50/90 text-slate-900 shadow-lg shadow-teal-100/60",
      avatar: "bg-teal-600 text-white",
      chip: "bg-teal-50 text-teal-800 border-teal-100",
      sub: "text-teal-700",
      meta: "text-slate-500",
      line: "#14b8a6",
    };
  }
  return {
    card: "border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-200/70",
    avatar: "bg-slate-700 text-white",
    chip: "bg-amber-50 text-amber-800 border-amber-100",
    sub: "text-brand-700",
    meta: "text-slate-500",
    line: "#99f6e4",
  };
}

function countTeam(node: ChartNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countTeam(c), 0);
}

function ProNodeCard({
  node,
  expanded,
  onToggle,
  selected,
  onSelect,
  compact,
}: {
  node: ChartNode;
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const tone = levelTone(node.level, node.tone);
  const team = countTeam(node);
  const hasKids = node.children.length > 0;
  const isRoot = node.tone === "root" || node.level === 5;

  return (
    <div
      className={`org-pro-node relative mx-auto text-right transition duration-300 ${
        compact ? "w-[168px]" : "w-[210px]"
      } ${selected ? "z-20 scale-[1.03]" : "z-10"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`group w-full overflow-hidden rounded-[1.25rem] border text-start transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${tone.card} ${
          selected ? "ring-2 ring-brand-400 ring-offset-2" : ""
        }`}
      >
        <div className={`flex items-center gap-3 ${compact ? "p-3" : "p-3.5"}`}>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold tracking-wide ${tone.avatar}`}
          >
            {initials(node.title)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`truncate text-[13px] font-bold leading-tight ${isRoot ? "text-white" : "text-slate-900"}`}>
                {node.title}
              </p>
              {node.badge && (
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                    isRoot ? "bg-white/20 text-white" : "bg-brand-100 text-brand-800"
                  }`}
                >
                  {node.badge}
                </span>
              )}
            </div>
            {node.subtitle && (
              <p className={`mt-0.5 truncate text-[11px] font-semibold ${tone.sub}`}>{node.subtitle}</p>
            )}
          </div>
        </div>

        {!compact && (
          <div className={`space-y-1.5 border-t px-3.5 py-2.5 ${isRoot ? "border-white/10" : "border-slate-100"}`}>
            {node.department && (
              <p className={`truncate text-[10px] ${tone.meta}`}>{node.department}</p>
            )}
            {node.markets && node.markets.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {node.markets.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className={`inline-flex max-w-full items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${tone.chip}`}
                  >
                    <Store size={9} />
                    <span className="truncate">{m}</span>
                  </span>
                ))}
                {node.markets.length > 2 && (
                  <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${tone.chip}`}>
                    +{node.markets.length - 2}
                  </span>
                )}
              </div>
            )}
            <div className={`flex items-center justify-between gap-2 text-[10px] ${tone.meta}`}>
              <span className="truncate">{node.code || node.phone || "—"}</span>
              {team > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Users size={10} />
                  {team}
                </span>
              )}
            </div>
          </div>
        )}
      </button>

      {hasKids && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute -bottom-3 left-1/2 z-30 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-md transition hover:bg-brand-50"
          title={expanded ? "داخستن" : "کردنەوە"}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}

function TreeBranch({
  node,
  expandedMap,
  toggle,
  selectedId,
  onSelect,
  compact,
}: {
  node: ChartNode;
  expandedMap: Record<string, boolean>;
  toggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const expanded = expandedMap[node.id] !== false;
  const hasKids = node.children.length > 0 && expanded;

  return (
    <li>
      <ProNodeCard
        node={node}
        expanded={expanded}
        onToggle={() => toggle(node.id)}
        selected={selectedId === node.id}
        onSelect={() => onSelect(node.id)}
        compact={compact}
      />
      {hasKids && (
        <ul>
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              expandedMap={expandedMap}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
              compact={compact}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function collectById(nodes: ChartNode[], map = new Map<string, ChartNode>()) {
  nodes.forEach((n) => {
    map.set(n.id, n);
    collectById(n.children, map);
  });
  return map;
}

export function ShapeOrgChart({
  roots,
  compact = false,
  selectedId,
  onSelect,
}: {
  roots: ChartNode[];
  compact?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const activeSelected = selectedId !== undefined ? selectedId : internalSelected;

  const nodeMap = useMemo(() => collectById(roots), [roots]);
  const selectedNode = activeSelected ? nodeMap.get(activeSelected) : null;

  function toggle(id: string) {
    setExpandedMap((prev) => {
      const currentlyOpen = prev[id] !== false;
      return { ...prev, [id]: !currentlyOpen };
    });
  }

  function expandAll() {
    const next: Record<string, boolean> = {};
    nodeMap.forEach((_, id) => {
      next[id] = true;
    });
    setExpandedMap(next);
  }

  function collapseAll() {
    const next: Record<string, boolean> = {};
    nodeMap.forEach((_, id) => {
      next[id] = false;
    });
    // keep roots visible children collapsed but roots themselves shown
    roots.forEach((r) => {
      next[r.id] = false;
    });
    setExpandedMap(next);
  }

  function handleSelect(id: string) {
    const next = activeSelected === id ? null : id;
    setInternalSelected(next);
    onSelect?.(next);
  }

  if (!roots.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-brand-700 px-2.5 py-1 font-semibold text-white">بەڕێوەبەر</span>
          <span className="rounded-full bg-teal-100 px-2.5 py-1 font-semibold text-teal-800">سەرپەرشتیار</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">کارمەند</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={expandAll} className="btn-secondary !px-3 !py-1.5 text-xs">
            کردنەوەی هەموو
          </button>
          <button type="button" onClick={collapseAll} className="btn-secondary !px-3 !py-1.5 text-xs">
            داخستنی هەموو
          </button>
        </div>
      </div>

      <div className="org-pro-canvas relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-inner">
        <div className="org-pro-grid absolute inset-0 opacity-70" />
        <div className="org-chart-wrap relative overflow-x-auto py-10">
          <div className="org-chart org-pro-chart inline-block min-w-full px-8">
            <ul className="org-chart-root">
              {roots.map((root) => (
                <TreeBranch
                  key={root.id}
                  node={root}
                  expandedMap={expandedMap}
                  toggle={toggle}
                  selectedId={activeSelected}
                  onSelect={handleSelect}
                  compact={compact}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="card animate-[fadeIn_0.25s_ease] border-brand-100 bg-gradient-to-l from-white to-brand-50/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-sm font-bold text-white">
                {initials(selectedNode.title)}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{selectedNode.title}</p>
                <p className="text-sm font-medium text-brand-700">{selectedNode.subtitle || "بێ پۆست"}</p>
              </div>
            </div>
            {selectedNode.badge && (
              <span className="rounded-lg bg-brand-100 px-2 py-1 text-xs font-bold text-brand-800">
                {selectedNode.badge}
              </span>
            )}
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            {selectedNode.department && <p>بەش: {selectedNode.department}</p>}
            {selectedNode.code && <p>کۆد: {selectedNode.code}</p>}
            {selectedNode.phone && (
              <p className="inline-flex items-center gap-1.5">
                <Phone size={14} /> {selectedNode.phone}
              </p>
            )}
            <p className="inline-flex items-center gap-1.5">
              <Users size={14} /> تیم: {countTeam(selectedNode)} کەس
            </p>
          </div>
          {!!selectedNode.markets?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedNode.markets.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
                >
                  <Store size={12} />
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
