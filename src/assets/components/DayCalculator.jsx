import { useEffect, useState, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AppContext } from "../../context/AppContext";
import LoadingBox from '../../assets/components/Loading';
import { format, addDays, subDays, isSameDay } from "date-fns";
import { FaGreaterThan, FaLessThan } from "react-icons/fa";

export default function DayCalculator({ holidays = [] }) {
  const [startDate, setStartDate] = useState(new Date());
  const [daysInput, setDaysInput] = useState("");
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludeHolidays, setExcludeHolidays] = useState(false);
  const [resultDate, setResultDate] = useState(new Date());
  const [overlappingHolidays, setOverlappingHolidays] = useState([]);
  const { token } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = () => {setShowLoading(true)};
  const stopLoading = () => {setShowLoading(false)};
  const [status, setStatus] = useState(0);
  const [bankReport, setBankReport] = useState([]);

  // ---------- Helpers ----------

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isHoliday = (date) => {
    const formatted = formatDate(date);
    return holidays.some((h) => h.date === formatted);
  };


  const prevDate = subDays(resultDate, 1);
  const nextDate = addDays(resultDate, 1);

  const grouped = {
    prev: [],
    today: [],
    next: [],
  };

  bankReport.forEach(item => {
    const itemDate = new Date(item.date);

    if (isSameDay(itemDate, prevDate)) grouped.prev.push(item);
    else if (isSameDay(itemDate, resultDate)) grouped.today.push(item);
    else if (isSameDay(itemDate, nextDate)) grouped.next.push(item);
  });

    const getTotal = (arr) =>
    arr.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);


    const increaseDays = () => {
      setDaysInput((prev) => (parseInt(prev || 0) + 1).toString());
    };

    const decreaseDays = () => {
      setDaysInput((prev) => {
        const value = parseInt(prev || 0) - 1;
        return value < 0 ? "0" : value.toString(); // prevent negative
      });
    };
  // ---------- Main Calculation ----------

    const calculate = () => {
    const totalDays = Number(daysInput);

    if (!totalDays || totalDays <= 0) {
        setResultDate(startDate);
        setOverlappingHolidays([]);
        return;
    }

    let count = 0;
    let current = new Date(startDate);

    // move to next day (do not count start date)
    current.setDate(current.getDate() + 1);

    while (count < totalDays) {
        const day = current.getDay();
        const formatted = current.toISOString().split("T")[0];

        const weekend = day === 0 || day === 6;
        const holiday = holidays.some((h) => h.date === formatted);

        const shouldExcludeWeekend = !excludeWeekends && weekend;
        const shouldExcludeHoliday = !excludeHolidays && holiday;

        if (!shouldExcludeWeekend && !shouldExcludeHoliday) {
        count++;
        }

        if (count < totalDays) {
        current.setDate(current.getDate() + 1);
        }
    }

    setResultDate(new Date(current));

    // show overlapping holidays in range
    const overlaps = holidays.filter((h) => {
        const hDate = new Date(h.date + "T00:00:00");
        return hDate > startDate && hDate <= current;
    });

    setOverlappingHolidays(overlaps);
    };


    async function getBankResultDate() {
      isLoading();
      const resDate = format(resultDate, "yyyy-MM-dd");
      const queryParams = new URLSearchParams();
      if (resDate) queryParams.append("date", resDate);

      const res = await fetch(`/api/getbankresultdate?${queryParams.toString()}`, {
          method: "get",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });
      const data = await res.json();
      console.log(data);
      if(res.ok) {
        setBankReport(data);
      }
      stopLoading();
    }


  useEffect(() => {
    const timer = setTimeout(() => {
      calculate();
    }, 500);

    return () => clearTimeout(timer);
  }, [startDate, daysInput, excludeWeekends, excludeHolidays]);

  useEffect(() => {
    if (!resultDate) return;

    const timer = setTimeout(() => {
      getBankResultDate();
    }, 500);

    return () => clearTimeout(timer);
  }, [resultDate]);

  // ---------- UI ----------

  return (
    <div className="sm:max-w-3xl mx-auto bg-white p-6 shadow-lg space-y-5 h-auto">

      <h2 className="text-xl font-bold text-gray-700">
        Day Calculator
      </h2>

      {/* Start Date */}
      <div className="flex flex-col items-center">
      <div className="w-full max-w-lg">
        <label className="block text-sm font-medium mb-1 text-center">
          Start Date
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="w-full border text-center rounded-md px-3 py-2"
          dateFormat="MMMM d, yyyy"
          wrapperClassName="w-full"
        />
      </div>
      </div>

      {/* Number of Days */}
      <div className="flex flex-col items-center">
      <div className="w-full max-w-lg">
        <label className="block text-sm font-medium mb-1">
          Number of Days
        </label>
        <input
          type="number"
          value={daysInput}
          onChange={(e) => setDaysInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getBankResultDate();
            }
          }}
          placeholder="Enter number of days"
          className="w-full border text-center rounded-md px-3 py-2"
        />
      </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={excludeWeekends}
            onChange={(e) => setExcludeWeekends(e.target.checked)}
          />
          Include Weekends
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={excludeHolidays}
            onChange={(e) => setExcludeHolidays(e.target.checked)}
          />
          Include Holidays
        </label>
      </div>

      {/* Result Date */}
      <div className="p-4  bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-gray-600">
          Result Date
        </p>
      
        <div className="flex items-center justify-center gap-8">
          <button className="px-3 py-3 text-gray-800 hover:text-gray-500 rounded" onClick={decreaseDays}>
            <div className="flex">
              <FaLessThan /><FaLessThan />
            </div>
          </button>

          <p className="text-lg font-semibold text-blue-700">
            {format(resultDate, "MMMM d, yyyy")}
          </p>

          <button className="px-3 py-3 text-gray-800 hover:text-gray-500 rounded" onClick={increaseDays}>
            <div className="flex">
              <FaGreaterThan /><FaGreaterThan />
            </div>
          </button>
        </div>
      </div>

      
      {bankReport.length > 0 && (
        
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

        {/* COLUMN TEMPLATE FUNCTION */}
        {[ 
          { label: prevDate, data: grouped.prev, highlight: false },
          { label: resultDate, data: grouped.today, highlight: true },
          { label: nextDate, data: grouped.next, highlight: false },
        ].map((col, idx) => (
          
          <div
            key={idx}
            className={`rounded-xl border p-4 shadow-sm transition-all duration-200
              ${col.highlight 
                ? "bg-blue-50 border-blue-300 shadow-md" 
                : "bg-gray-50 border-gray-200"}
            `}
          >

            {/* HEADER (DATE + TOTAL IN ONE ROW) */}
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-lg 
                ${col.highlight ? "text-blue-700" : "text-gray-700"}`}>
                {format(col.label, "dd")}
              </span>

              <span className="font-semibold text-sm text-gray-600">
                {getTotal(col.data).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <hr className="mb-2 border-gray-200" />

            {/* LIST */}
            <div className="space-y-1 text-xs">
              {col.data.length > 0 ? (
                col.data.map((e, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-gray-700 truncate"
                  >
                    <span className="truncate">{e.bank}</span>
                    <span className="font-medium">
                      {parseFloat(e.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No data
                </div>
              )}
            </div>

          </div>
        ))}

      </div>
      )}

<LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />

      {/* Overlapping Holidays */}
      {overlappingHolidays.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-left">
          <h4 className="font-semibold text-red-600 text-sm mb-2">
            Holidays within selected range:
          </h4>

          <ul className="list-disc list-inside text-sm space-y-1">
            {overlappingHolidays.map((holiday, index) => (
              <li key={index}>
                {format(holiday.date, "MMMM d, yyyy")} – {holiday.name}
                <span className="ml-2 text-xs px-2 py-1 bg-gray-200 rounded">
                  {holiday.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
    
  );
}