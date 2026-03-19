import { BASE_URL } from "./config.js";

const monthLabel = document.getElementById("month_label");
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

function setGridLayout(mode) {
  if (!grid) return;
  if (mode === "month") {
    grid.className = "flex-1 grid grid-cols-7 grid-rows-6";
  } else if (mode === "week") {
    grid.className = "flex-1 grid grid-cols-7 grid-rows-1";
  } else {
    grid.className = "flex-1 grid grid-cols-1 grid-rows-1";
  }
}

function buildGrid(viewDate) {
  if (!grid) return [];

  grid.innerHTML = "";
  const cells = [];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  if (viewMode === "month") {
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("div");
      cell.className = "border-b border-r border-gray-100 p-2 min-h-[110px]";

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

      cell.dataset.date = isoDate(cellDate);

      const num = document.createElement("span");
      num.className = muted ? "text-sm text-gray-300" : "text-sm font-semibold text-gray-800";
      num.textContent = displayNum;
      cell.appendChild(num);

      grid.appendChild(cell);
      cells.push(cell);
    }
  } else if (viewMode === "week") {
    const startOfWeek = new Date(viewDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(startOfWeek);
      cellDate.setDate(startOfWeek.getDate() + i);
      const cell = document.createElement("div");
      cell.className = "border-b border-r border-gray-100 p-2 min-h-[110px]";
      cell.dataset.date = isoDate(cellDate);

      const num = document.createElement("span");
      const muted = cellDate.getMonth() !== month;
      num.className = muted ? "text-sm text-gray-300" : "text-sm font-semibold text-gray-800";
      num.textContent = cellDate.getDate();
      cell.appendChild(num);

      grid.appendChild(cell);
      cells.push(cell);
    }
  } else {
    const cellDate = new Date(viewDate);
    const cell = document.createElement("div");
    cell.className = "border-b border-r border-gray-100 p-2 min-h-[110px]";
    cell.dataset.date = isoDate(cellDate);

    const num = document.createElement("span");
    num.className = "text-sm font-semibold text-gray-800";
    num.textContent = cellDate.getDate();
    cell.appendChild(num);

    grid.appendChild(cell);
    cells.push(cell);
  }

  return cells;
}

function renderEvents(events) {
  if (!grid || !events) return;

  const byDate = events.reduce((acc, ev) => {
    if (!ev || !ev.date) return acc;
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  Array.from(grid.children).forEach((cell) => {
    const date = cell.dataset.date;
    if (!date || !byDate[date]) return;

    // Sort by start time so the day view is ordered.
    byDate[date].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

    const wrap = document.createElement("div");
    wrap.className = "mt-1 space-y-1";

    const statusColors = {
      todo: { text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
      in_progress: { text: "text-blue-800", bg: "bg-blue-50", border: "border-blue-200" },
      completed: { text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" },
    };

    const formatTime = (t) => (t ? t.slice(0, 5) : "");

    byDate[date].forEach((ev) => {
      const pill = document.createElement("span");
      pill.className = "inline-block text-xs font-medium px-2 py-0.5 rounded-md border";
      const start = formatTime(ev.start_time);
      const end = formatTime(ev.end_time);
      pill.textContent = [start && end ? `${start}-${end}` : start || end, ev.title || "Untitled"].filter(Boolean).join(" · ");

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

      wrap.appendChild(pill);
    });

    cell.appendChild(wrap);
  });
}

async function loadEvents(range) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return [];
  }

  const months = monthsInRange(range.start, range.end);

  const responses = await Promise.all(months.map(async (m) => {
    const res = await fetch(`${BASE_URL}/calendar?month=${m}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Calendar fetch failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.events) ? data.events : [];
  }));

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
      monthLabel.textContent = `Week of ${startOfWeek.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
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
  const cells = buildGrid(currentMonth);
  const range = getViewRange(currentMonth);

  try {
    const events = await loadEvents(range);
    renderEvents(events);
  } catch (error) {
    console.error(error);
  }
}

function shiftMonth(delta) {
  if (viewMode === "month") {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
  } else if (viewMode === "week") {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate() + delta * 7);
  } else {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate() + delta);
  }
  render();
}

if (prevBtn) prevBtn.addEventListener("click", () => shiftMonth(-1));
if (nextBtn) nextBtn.addEventListener("click", () => shiftMonth(1));
if (todayBtn) todayBtn.addEventListener("click", () => {
  currentMonth = new Date();
  render();
});

function setActiveView(mode) {
  viewMode = mode;
  [dayBtn, weekBtn, monthBtn].forEach((btn) => {
    if (!btn) return;
    btn.classList.remove("font-semibold", "text-gray-900", "bg-gray-100");
    btn.classList.add("text-gray-500");
  });

  const active = mode === "day" ? dayBtn : mode === "week" ? weekBtn : monthBtn;
  if (active) {
    active.classList.add("font-semibold", "text-gray-900", "bg-gray-100");
    active.classList.remove("text-gray-500");
  }
}

if (dayBtn) dayBtn.addEventListener("click", () => { setActiveView("day"); render(); });
if (weekBtn) weekBtn.addEventListener("click", () => { setActiveView("week"); render(); });
if (monthBtn) monthBtn.addEventListener("click", () => { setActiveView("month"); render(); });

// Initialize
setActiveView("month");

document.addEventListener("DOMContentLoaded", render);