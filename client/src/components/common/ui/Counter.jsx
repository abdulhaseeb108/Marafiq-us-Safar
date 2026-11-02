import { Minus, Plus } from "lucide-react";

export default function Counter({ id, label, value, onChange, min = 0, max = 30 }) {
  return (
    <div className="ctr" role="group" aria-labelledby={id}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={18} aria-hidden="true" />
      </button>
      <output aria-labelledby={id}>{value}</output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
