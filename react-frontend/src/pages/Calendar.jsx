import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function isoMonth(date) {
  return date.toISOString().slice(0, 7);
}

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const shiftMonth = (delta) => {
    setCurrentMonth((prev) => {
      const date = new Date(prev);
      if (viewMode === "month") {
        return new Date(date.getFullYear(), date.getMonth() + delta, 1);
      } else if (viewMode === "week") {
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + delta * 7,
        );
      } else {
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + delta,
        );
      }
    });
  };

  const getViewRange = (date, mode) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    if (mode === "month") {
      const first = new Date(year, month, 1);
      const start = new Date(first);
      start.setDate(start.getDate() - first.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 41);
      return { start, end };
    }
    if (mode === "week") {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    const start = new Date(date);
    const end = new Date(date);
    return { start, end };
  };

  const loadEvents = async (range) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const months = new Set();
      const cursor = new Date(
        range.start.getFullYear(),
        range.start.getMonth(),
        1,
      );
      const endMonth = new Date(
        range.end.getFullYear(),
        range.end.getMonth(),
        1,
      );
      while (cursor <= endMonth) {
        months.add(isoMonth(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }

      const responses = await Promise.all(
        Array.from(months).map(async (m) => {
          const res = await fetch(`${BASE_URL}/calendar?month=${m}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Fetch failed");
          const data = await res.json();
          return Array.isArray(data.events) ? data.events : [];
        }),
      );

      const allEvents = responses.flat().filter((ev) => {
        if (!ev || !ev.date) return false;
        const d = parseISODate(ev.date);
        return d >= range.start && d <= range.end;
      });
      setEvents(allEvents);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(getViewRange(currentMonth, viewMode));
    // eslint-disable-next-line
  }, [currentMonth, viewMode]);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const buildGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const todayStr = new Date().toDateString();
    const cells = [];

    if (viewMode === "month") {
      const first = new Date(year, month, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysPrevMonth = new Date(year, month, 0).getDate();

      for (let i = 0; i < 42; i++) {
        const dayNumber = i - startDay + 1;
        let cellDate,
          muted = false;
        if (dayNumber < 1) {
          cellDate = new Date(year, month - 1, daysPrevMonth + dayNumber);
          muted = true;
        } else if (dayNumber > daysInMonth) {
          cellDate = new Date(year, month + 1, dayNumber - daysInMonth);
          muted = true;
        } else {
          cellDate = new Date(year, month, dayNumber);
        }
        cells.push({
          date: cellDate,
          muted,
          isToday: cellDate.toDateString() === todayStr,
        });
      }
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentMonth);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      for (let i = 0; i < 7; i++) {
        const cellDate = new Date(startOfWeek);
        cellDate.setDate(startOfWeek.getDate() + i);
        cells.push({
          date: cellDate,
          muted: cellDate.getMonth() !== month,
          isToday: cellDate.toDateString() === todayStr,
        });
      }
    } else {
      cells.push({
        date: new Date(currentMonth),
        muted: false,
        isToday: currentMonth.toDateString() === todayStr,
      });
    }
    return cells;
  };

  const getLabel = () => {
    if (viewMode === "month") {
      return currentMonth.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentMonth);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return `Week of ${startOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentMonth.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const byDate = events.reduce((acc, ev) => {
    if (!ev || !ev.date) return acc;
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const statusColors = {
    todo: "text-amber-700 bg-amber-50 border-amber-200",
    in_progress: "text-coral bg-skin border-coral/20",
    completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface relative z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] rounded-3xl overflow-hidden selection:bg-coral selection:text-white m-4">
      <header className="flex justify-between items-center px-8 py-5 border-b border-glass-border/40 bg-surface/60 backdrop-blur-xl z-20 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-navy tracking-tight min-w-[200px]">
            {getLabel()}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3.5 py-1.5 text-sm font-semibold text-navy/80 bg-surface border border-skin rounded-md hover:bg-skin/50 hover:border-navy/20 transition-all shadow-sm"
            >
              Today
            </button>
            <div className="flex items-center bg-skin/50 border border-skin rounded-md p-0.5 shadow-sm">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-1 text-navy/50 hover:text-navy hover:bg-surface rounded transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
              <button
                onClick={() => shiftMonth(1)}
                className="p-1 text-navy/50 hover:text-navy hover:bg-surface rounded transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-surface/50 p-1 rounded-xl border border-navy/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md">
          {["day", "week", "month"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${viewMode === mode ? "text-navy bg-surface shadow-md ring-1 ring-glass-border/50 scale-105" : "text-navy/60 hover:text-navy hover:bg-surface/50"}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden bg-surface">
        <div
          className={`grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} border-b border-skin bg-skin/50/50`}
        >
          {viewMode === "day" ? (
            <div className="py-2.5 text-center text-[11px] font-semibold text-navy/60 uppercase tracking-widest">
              {daysOfWeek[currentMonth.getDay()]}
            </div>
          ) : (
            daysOfWeek.map((day, i) => (
              <div
                key={day}
                className={`py-2.5 text-center text-[11px] font-semibold text-navy/60 uppercase tracking-widest ${i > 0 ? "border-l border-skin/50" : ""}`}
              >
                {day}
              </div>
            ))
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div
            className={`grid ${viewMode === "day" ? "grid-cols-1 grid-rows-1" : viewMode === "week" ? "grid-cols-7 grid-rows-1" : "grid-cols-7 grid-rows-6"} h-full min-h-[600px]`}
          >
            {buildGrid().map((cell, idx) => {
              const dateStr = isoDate(cell.date);
              const cellEvents = (byDate[dateStr] || []).sort((a, b) =>
                (a.start_time || "").localeCompare(b.start_time || ""),
              );

              return (
                <div
                  key={idx}
                  className="border-b border-r border-skin/60 p-2 min-h-[110px] bg-surface hover:bg-skin/30 transition-all duration-300 group relative flex flex-col"
                >
                  <div className="flex justify-center mb-1.5">
                    <span
                      className={`text-xs flex items-center justify-center rounded-full mt-0.5 transition-all duration-300 ${cell.isToday ? "font-bold text-white bg-coral w-7 h-7 shadow-md scale-110" : `font-bold w-7 h-7 hover:bg-skin/50 ${cell.muted ? "text-navy/30" : "text-navy/80"}`}`}
                    >
                      {cell.date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-0.5 pb-1 custom-scrollbar">
                    {cellEvents.map((ev, eIdx) => {
                      const start = ev.start_time
                        ? ev.start_time.slice(0, 5)
                        : "";
                      const end = ev.end_time ? ev.end_time.slice(0, 5) : "";
                      const timeStr =
                        start && end ? `${start}-${end}` : start || end;
                      const text = [timeStr, ev.title || "Untitled"]
                        .filter(Boolean)
                        .join(" ");
                      const titleAttr = ev.project_name
                        ? `${ev.project_name}${ev.description ? " — " + ev.description : ""}`
                        : ev.description || "";

                      const pillClasses =
                        statusColors[ev.status] ||
                        "text-coral bg-skin border-coral/20";

                      return (
                        <div
                          key={eIdx}
                          title={titleAttr}
                          className={`block w-full text-[11px] font-bold px-2 py-1.5 rounded-lg border truncate cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${pillClasses}`}
                        >
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
