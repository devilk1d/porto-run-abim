"use client";

interface OrderControlProps {
  index: number;
  total: number;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function OrderControl({
  index,
  total,
  disabled = false,
  onMoveUp,
  onMoveDown,
}: OrderControlProps) {
  return (
    <div className="admin-reorder-group">
      <span className="mono muted" style={{ minWidth: "22px", fontSize: "12px" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="admin-reorder-btns">
        <button
          type="button"
          title="Move Up"
          aria-label="Move Up"
          disabled={disabled || index === 0}
          onClick={onMoveUp}
          className="admin-reorder-btn"
        >
          ▲
        </button>
        <button
          type="button"
          title="Move Down"
          aria-label="Move Down"
          disabled={disabled || index === total - 1}
          onClick={onMoveDown}
          className="admin-reorder-btn"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
