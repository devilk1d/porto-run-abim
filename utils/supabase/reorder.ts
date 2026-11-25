import { createClient } from "./client";

export type ReorderableTable = "projects" | "certificates" | "experiences" | "about_chapters";

export interface ReorderableItem {
  id: string;
  order_index: number;
  [key: string]: unknown;
}

/** Returns a swapped and sequentially re-indexed copy of `items`, or `null` when out of bounds. */
export function swapReorderList<T extends { order_index: number }>(
  items: T[],
  currentIndex: number,
  direction: "up" | "down"
): T[] | null {
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return null;
  }

  const swapped = [...items];
  swapped[currentIndex] = items[targetIndex];
  swapped[targetIndex] = items[currentIndex];
  return swapped.map((item, idx) => ({ ...item, order_index: idx }));
}

/**
 * Reusable function to reorder items in an array and persist the new order to Supabase.
 * Swaps positions between `currentIndex` and target neighbor (`up` or `down`).
 * Returns optimistic updated array and status.
 */
export async function reorderItems<T extends ReorderableItem>(
  table: ReorderableTable,
  items: T[],
  currentIndex: number,
  direction: "up" | "down"
): Promise<{ success: boolean; newItems: T[]; error?: string }> {
  const updatedList = swapReorderList(items, currentIndex, direction);
  if (!updatedList) {
    return { success: false, newItems: items };
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const currentItem = items[currentIndex];
  const targetItem = items[targetIndex];

  // Normalized order index values to assign in DB
  const newCurrentOrder =
    targetItem.order_index !== currentItem.order_index
      ? targetItem.order_index
      : targetIndex;
  const newTargetOrder =
    targetItem.order_index !== currentItem.order_index
      ? currentItem.order_index
      : currentIndex;

  const supabase = createClient();

  // Update both swapped items in Supabase
  const updateCurrent = supabase
    .from(table)
    .update({ order_index: newCurrentOrder, updated_at: new Date().toISOString() })
    .eq("id", currentItem.id);

  const updateTarget = supabase
    .from(table)
    .update({ order_index: newTargetOrder, updated_at: new Date().toISOString() })
    .eq("id", targetItem.id);

  const [resA, resB] = await Promise.all([updateCurrent, updateTarget]);

  if (resA.error || resB.error) {
    const errorMsg =
      resA.error?.message || resB.error?.message || "Failed to update item order in database.";
    return { success: false, newItems: items, error: errorMsg };
  }

  return { success: true, newItems: updatedList };
}
