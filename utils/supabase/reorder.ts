import { createClient } from "./client";

export type ReorderableTable = "projects" | "certificates" | "experiences" | "about_chapters";

export interface ReorderableItem {
  id: string;
  order_index: number;
  [key: string]: unknown;
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
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return { success: false, newItems: items };
  }

  const currentItem = items[currentIndex];
  const targetItem = items[targetIndex];

  // Create a copy of the items array and swap
  const swapped = [...items];
  swapped[currentIndex] = targetItem;
  swapped[targetIndex] = currentItem;

  // Normalized order index values to assign in DB
  const newCurrentOrder =
    targetItem.order_index !== currentItem.order_index
      ? targetItem.order_index
      : targetIndex;
  const newTargetOrder =
    targetItem.order_index !== currentItem.order_index
      ? currentItem.order_index
      : currentIndex;

  // Re-assign normalized sequential order_index in state array
  const updatedList = swapped.map((item, idx) => ({
    ...item,
    order_index: idx,
  }));

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
