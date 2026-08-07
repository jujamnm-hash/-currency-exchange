export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function buildDepartmentTree<T extends { id: string; parentId?: string | null }>(items: T[]) {
  type Node = T & { children: Node[] };
  const map = new Map<string, Node>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));
  const roots: Node[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
