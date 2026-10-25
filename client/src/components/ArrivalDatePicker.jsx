import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";
import { FIRST_DAY, LAST_DAY } from "../data/calculator.jsx";
import { validDate } from "../utils/travel.js";

const asDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const asDateString = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

export default function ArrivalDatePicker({ value, error, onChange }) {
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const selectedDate = validDate(value) ? asDate(value) : undefined;
  const minDate = asDate(FIRST_DAY);
  const maxDate = asDate(LAST_DAY);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selectedDate || minDate);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const openPicker = () => {
    setMonth(selectedDate || minDate);
    setOpen((current) => !current);
  };

  const selectDate = (date) => {
    if (!date) return;
    onChange(asDateString(date));
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className="arrival-picker" ref={pickerRef}>
      <button
        ref={buttonRef}
        id="arrival"
        type="button"
        className={`arrival-picker-trigger ${error ? "invalid" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="arrival-calendar"
        aria-invalid={!!error}
        aria-describedby={error ? "e-date" : "h-date"}
        onClick={openPicker}
      >
        <CalendarDays aria-hidden="true" />
        <span className={selectedDate ? "" : "placeholder"}>
          {selectedDate
            ? selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : "Choose your arrival date"}
        </span>
        <ChevronDown className="arrival-picker-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="arrival-calendar-popover" id="arrival-calendar" role="dialog" aria-label="Choose arrival date">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={selectDate}
            month={month}
            onMonthChange={setMonth}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[{ before: minDate }, { after: maxDate }]}
            captionLayout="dropdown"
            navLayout="after"
            weekStartsOn={1}
            showOutsideDays
            autoFocus
          />
          <p className="calendar-range-note">Available dates: {FIRST_DAY} – {LAST_DAY}</p>
        </div>
      )}
    </div>
  );
}
