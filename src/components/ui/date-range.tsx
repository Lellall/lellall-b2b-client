import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateRangePickerProps {
  onChange?: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: {
    startDate: Date;
    endDate: Date;
  };
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange, initialRange }) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState({
    startDate: initialRange?.startDate || new Date(),
    endDate: initialRange?.endDate || new Date(),
  });
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const newDate = new Date(event.target.value);
    const updatedRange = { ...dateRange, [type === "start" ? "startDate" : "endDate"]: newDate };
    setDateRange(updatedRange);
    onChange && onChange(updatedRange);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative font-light w-fit ml-2 text-sm" ref={calendarRef}>
      <div
        className="flex items-center gap-2 px-4 py-3  rounded-lg cursor-pointer bg-white text-green-900 hover:border-green-600"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <Calendar className="w-5 h-5 text-green-700" />
        <span>
          {format(dateRange.startDate, "dd/MM/yyyy")} — {format(dateRange.endDate, "dd/MM/yyyy")}
        </span>
      </div>

      {showCalendar && (
        <div className="absolute z-10 mt-2 bg-white   shadow-md rounded-lg p-2 flex flex-col">
          <label className="text-sm text-gray-600">Start Date</label>
          <input
            type="date"
            value={format(dateRange.startDate, "yyyy-MM-dd")}
            onChange={(e) => handleDateChange(e, "start")}
            className="border p-1 rounded-md mb-2"
          />
          <label className="text-sm text-gray-600">End Date</label>
          <input
            type="date"
            value={format(dateRange.endDate, "yyyy-MM-dd")}
            onChange={(e) => handleDateChange(e, "end")}
            className="border p-1 rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
