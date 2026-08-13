import { prisma } from "./prisma";

export async function nextNumber(prefix: string, sequenceId: string): Promise<string> {
  const seq = await prisma.sequence.upsert({
    where: { id: sequenceId },
    create: { id: sequenceId, value: 1 },
    update: { value: { increment: 1 } },
  });
  const n = String(seq.value).padStart(5, "0");
  return `${prefix}-${n}`;
}

export function cuidLike(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
