import { Check } from "lucide-react";

export default function CheckGroup({ legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="lab">{legend}</legend>
      <div className="opts cols">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <label key={option} className={`opt ${selected ? "on" : ""}`}>
              <input
                type="checkbox"
                className="sr"
                checked={selected}
                onChange={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])}
              />
              <span className="opt-main"><b>{option}</b></span>
              {selected && <Check className="tick" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
