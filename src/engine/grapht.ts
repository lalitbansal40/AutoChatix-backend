import { AutomationEdge } from "../models/automation.model";

export const getNextNodeId = (
  edges: AutomationEdge[],
  currentNodeId: string,
  inputId?: string
): string | null => {

  // ✅ 1. condition match
  const matched = edges.find(
    (e) =>
      e.from === currentNodeId &&
      e.condition &&
      e.condition === inputId
  );

  if (matched) {
    return matched.to;
  }

  // ✅ 2. fallback (no condition edge)
  const fallback = edges.find(
    (e) => e.from === currentNodeId && !e.condition
  );

  return fallback?.to || null;
};