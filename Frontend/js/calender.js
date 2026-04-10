import { BASE_URL } from "./config.js";

const monthLabel = document.getElementById("month_label");
const headersContainer = document.getElementById("calendar_headers");
const grid = document.getElementById("calendar_grid");
const prevBtn = document.getElementById("prev_month");
const nextBtn = document.getElementById("next_month");
const todayBtn = document.getElementById("today_btn");
const dayBtn = document.getElementById("day_btn");
const weekBtn = document.getElementById("week_btn");
const monthBtn = document.getElementById("month_btn");

let currentMonth = new Date();
let viewMode = "month"; // "day" | "week" | "month"

function formatMonth(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function isoMonth(date) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getViewRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (viewMode === "month") {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 41); // 6 weeks
    return { start, end };
  }

  if (viewMode === "week") {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  const start = new Date(date);
  const end = new Date(date);
  return { start, end };
}

function monthsInRange(start, end) {
  const months = new Set();
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    months.add(isoMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Array.from(months);
}

// Dynamically render the Days of the Week headers
function renderHeaders(viewDate) {
  if (!headersContainer) return;
  headersContainer.innerHTML = "";

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (viewMode === "month" || viewMode === "week") {
    headersContainer.className =
      "grid grid-cols-7 border-b border-gray-100 bg-gray-50/50";
    for (let i = 0; i < 7; i++) {
      const header = document.createElement("div");
      header.className =
        "py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-widest" +
        (i > 0 ? " border-l border-gray-100/50" : "");
      header.textContent = daysOfWeek[i];
      headersContainer.appendChild(header);
    }
  } else if (viewMode === "day") {
    headersContainer.className =
      "grid grid-cols-1 border-b border-gray-100 bg-gray-50/50";
    const header = document.createElement("div");
    header.className =
      "py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-widest";
    header.textContent = daysOfWeek[viewDate.getDay()];
    headersContainer.appendChild(header);
  }
}

function setGridLayout(mode) {
  if (!grid) return;
  if (mode === "month") {
    grid.className = "grid grid-cols-7 grid-rows-6 h-full min-h-[600px]";
  } else if (mode === "week") {
    grid.className = "grid grid-cols-7 grid-rows-1 h-full min-h-full";
  } else {
    grid.className = "grid grid-cols-1 grid-rows-1 h-full min-h-full";
  }
}

function buildGrid(viewDate) {
  if (!grid) return [];

  grid.innerHTML = "";
  const cells = [];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = new Date().toDateString();

  const createCell = (cellDate, muted) => {
    const cell = document.createElement("div");
    // Added a subtle hover background to cells
    cell.className =
      "border-b border-r border-gray-100 p-1.5 min-h-[110px] bg-white hover:bg-gray-50/50 transition-colors group relative flex flex-col";
    cell.dataset.date = isoDate(cellDate);

    const isToday = cellDate.toDateString() === todayStr;

    // Header area of the cell (holds the number)
    const headerDiv = document.createElement("div");
    headerDiv.className = "flex justify-center mb-1";

    const num = document.createElement("span");

    // Refined Today Highlight
    if (isToday) {
      num.className =
        "text-xs font-bold text-white bg-blue-600 w-6 h-6 flex items-center justify-center rounded-full mt-0.5 shadow-sm";
    } else {
      num.className = `text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mt-0.5 ${muted ? "text-gray-300" : "text-gray-700"}`;
    }

    num.textContent = cellDate.getDate();
    headerDiv.appendChild(num);
    cell.appendChild(headerDiv);

    // Container for events inside the cell
    const eventsContainer = document.createElement("div");
    eventsContainer.className =
      "flex-1 flex flex-col gap-1 overflow-y-auto px-0.5 pb-1";
    cell.appendChild(eventsContainer);

    grid.appendChild(cell);
    cells.push({ cell, eventsContainer, date: isoDate(cellDate) });
  };

  if (viewMode === "month") {
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < 42; i++) {
      const dayNumber = i - startDay + 1;
      let displayNum;
      let cellDate;
      let muted = false;

      if (dayNumber < 1) {
        displayNum = daysPrevMonth + dayNumber;
        cellDate = new Date(year, month - 1, displayNum);
        muted = true;
      } else if (dayNumber > daysInMonth) {
        displayNum = dayNumber - daysInMonth;
        cellDate = new Date(year, month + 1, displayNum);
        muted = true;
      } else {
        displayNum = dayNumber;
        cellDate = new Date(year, month, displayNum);
      }
      createCell(cellDate, muted);
    }
  } else if (viewMode === "week") {
    const startOfWeek = new Date(viewDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(startOfWeek);
      cellDate.setDate(startOfWeek.getDate() + i);
      const muted = cellDate.getMonth() !== month;
      createCell(cellDate, muted);
    }
  } else {
    createCell(new Date(viewDate), false);
  }

  return cells;
}

function renderEvents(events, cellObjects) {
  if (!events || !cellObjects) return;

  const byDate = events.reduce((acc, ev) => {
    if (!ev || !ev.date) return acc;
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  cellObjects.forEach(({ eventsContainer, date }) => {
    if (!byDate[date]) return;

    // Sort by start time
    byDate[date].sort((a, b) =>
      (a.start_time || "").localeCompare(b.start_time || ""),
    );

    const statusColors = {
      todo: {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
      in_progress: {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      completed: {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
    };

    const formatTime = (t) => (t ? t.slice(0, 5) : "");

    byDate[date].forEach((ev) => {
      const pill = document.createElement("div");
      // Refined Pill: Block display, truncate text, pointer cursor
      pill.className =
        "block w-full text-[11px] font-medium px-2 py-1 rounded-md border truncate cursor-pointer transition-all hover:opacity-80 hover:shadow-sm";

      const start = formatTime(ev.start_time);
      const end = formatTime(ev.end_time);
      pill.textContent = [
        start && end ? `${start}-${end}` : start || end,
        ev.title || "Untitled",
      ]
        .filter(Boolean)
        .join(" ");

      const mapped = statusColors[ev.status];
      if (mapped) {
        pill.classList.add(mapped.text, mapped.bg, mapped.border);
      } else if (ev.color) {
        pill.style.backgroundColor = `${ev.color}1A`;
        pill.style.color = ev.color;
        pill.style.borderColor = `${ev.color}33`;
      } else {
        pill.classList.add("text-blue-700", "bg-blue-50", "border-blue-200");
      }

      if (ev.project_name) {
        pill.title = `${ev.project_name}${ev.description ? " — " + ev.description : ""}`;
      } else if (ev.description) {
        pill.title = ev.description;
      }

      eventsContainer.appendChild(pill);
    });
  });
}

async function loadEvents(range) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return [];
  }

  const months = monthsInRange(range.start, range.end);

  const responses = await Promise.all(
    months.map(async (m) => {
      const res = await fetch(`${BASE_URL}/calendar?month=${m}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Calendar fetch failed: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.events) ? data.events : [];
    }),
  );

  const allEvents = responses.flat();

  return allEvents.filter((ev) => {
    if (!ev || !ev.date) return false;
    const d = parseISODate(ev.date);
    return d >= range.start && d <= range.end;
  });
}

async function render() {
  if (monthLabel) {
    if (viewMode === "month") {
      monthLabel.textContent = formatMonth(currentMonth);
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentMonth);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      monthLabel.textContent = `Week of ${startOfWeek.toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )}`;
    } else {
      monthLabel.textContent = currentMonth.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  setGridLayout(viewMode);
  renderHeaders(currentMonth); // Injects dynamic headers
  const cellObjects = buildGrid(currentMonth);
  const range = getViewRange(currentMonth);

  try {
    const events = await loadEvents(range);
    renderEvents(events, cellObjects);
  } catch (error) {
    console.error(error);
  }
}

function shiftMonth(delta) {
  if (viewMode === "month") {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + delta,
      1,
    );
  } else if (viewMode === "week") {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      currentMonth.getDate() + delta * 7,
    );
  } else {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      currentMonth.getDate() + delta,
    );
  }
  render();
}

if (prevBtn) prevBtn.addEventListener("click", () => shiftMonth(-1));
if (nextBtn) nextBtn.addEventListener("click", () => shiftMonth(1));
if (todayBtn)
  todayBtn.addEventListener("click", () => {
    currentMonth = new Date();
    render();
  });

function setActiveView(mode) {
  viewMode = mode;
  [dayBtn, weekBtn, monthBtn].forEach((btn) => {
    if (!btn) return;
    // Reset classes to inactive state
    btn.className =
      "px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 transition-all";
  });

  const active = mode === "day" ? dayBtn : mode === "week" ? weekBtn : monthBtn;
  if (active) {
    // Apply active state classes
    active.className =
      "px-4 py-1.5 text-sm font-semibold rounded-md text-gray-900 bg-white shadow-sm ring-1 ring-gray-200/50 transition-all";
  }
}

if (dayBtn)
  dayBtn.addEventListener("click", () => {
    setActiveView("day");
    render();
  });
if (weekBtn)
  weekBtn.addEventListener("click", () => {
    setActiveView("week");
    render();
  });
if (monthBtn)
  monthBtn.addEventListener("click", () => {
    setActiveView("month");
    render();
  });

// Initialize
setActiveView("month");
document.addEventListener("DOMContentLoaded", render);
