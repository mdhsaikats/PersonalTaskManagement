import { BASE_URL } from "./config.js";

const PRIORITY_BADGE = {
  critical: "text-red-700 bg-red-50",
  high: "text-amber-700 bg-amber-50",
  normal: "text-blue-700 bg-blue-50",
  overdue: "text-gray-700 bg-gray-100",
  unscheduled: "text-gray-500 bg-gray-100",
  invalid_date: "text-gray-500 bg-gray-100",
};

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderUpcomingSkeleton(show) {
  const skeleton = document.getElementById("upcoming_skeleton");
  const list = document.getElementById("upcoming_list");
  if (!skeleton || !list) return;
  skeleton.classList.toggle("hidden", !show);
  list.classList.toggle("hidden", show);
}

function renderUpcomingList(items) {
  const list = document.getElementById("upcoming_list");
  if (!list) return;

  if (!items || items.length === 0) {
    list.innerHTML = `<p class="px-6 py-4 text-sm text-gray-500">No upcoming deadlines</p>`;
    return;
  }

  const html = items
    .slice(0, 4)
    .map((item) => {
      const priority = item.priority || "normal";
      const badgeClass = PRIORITY_BADGE[priority] || PRIORITY_BADGE.normal;
      const dueText = formatDate(item.due_date);
      return `
            <div class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${item.title || "Untitled task"}</p>
                        <p class="text-xs text-gray-400 mt-0.5">Due ${dueText}</p>
                    </div>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}">${priority}</span>
            </div>`;
    })
    .join("");

  list.innerHTML = html;
}

async function loadUpcomingDeadlines() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  renderUpcomingSkeleton(true);

  try {
    const response = await fetch(BASE_URL + "/dashboard/upcoming", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      console.error("Upcoming deadlines fetch failed:", response.status);
      renderUpcomingSkeleton(false);
      renderUpcomingList([]);
      return;
    }

    const data = await response.json();
    const upcoming = data.upcoming || [];
    renderUpcomingSkeleton(false);
    renderUpcomingList(upcoming);
  } catch (error) {
    console.error("Unable to load upcoming deadlines:", error);
    renderUpcomingSkeleton(false);
    renderUpcomingList([]);
  }
}

function updateStatValue(valueId, skeletonId, value) {
  const valueEl = document.getElementById(valueId);
  const skeletonEl = document.getElementById(skeletonId);

  if (!valueEl) return;

  valueEl.textContent = String(value ?? 0);
  valueEl.classList.remove("opacity-0");

  if (skeletonEl) {
    skeletonEl.classList.add("hidden");
  }
}

function showStatFallback() {
  updateStatValue("total_task", "total_task_skeleton", 0);
  updateStatValue("completed_task", "completed_task_skeleton", 0);
  updateStatValue("in_progress_task", "in_progress_task_skeleton", 0);
}

async function DashboardHeader() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(BASE_URL + "/dashboard/header", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      console.error("Dashboard header fetch failed:", response.status);
      showStatFallback();
      return;
    }

    const data = await response.json();

    updateStatValue("total_task", "total_task_skeleton", data.total_tasks);
    updateStatValue(
      "completed_task",
      "completed_task_skeleton",
      data.completed,
    );
    updateStatValue(
      "in_progress_task",
      "in_progress_task_skeleton",
      data.in_progress,
    );
  } catch (error) {
    console.error("Unable to load dashboard stats:", error);
    showStatFallback();
  }
}

async function TodaysTask() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const todaysTaskEl = document.getElementById("todaystask");
  if (!todaysTaskEl) return;

  try {
    const response = await fetch(BASE_URL + "/dashboard/todaystask", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      console.error("Todays task fetch failed:", response.status);
      todaysTaskEl.innerHTML =
        '<p class="px-6 py-4 text-sm text-gray-400">No task for today</p>';
      return;
    }

    const data = await response.json();
    const taskTitle = data.task_title || "No task for today";

    todaysTaskEl.innerHTML = `
          <div class="px-6 py-4">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"></span>
              <p class="text-sm font-medium text-gray-900">${taskTitle}</p>
            </div>
          </div>
        `;
  } catch (error) {
    console.error("Unable to load todays task:", error);
    todaysTaskEl.innerHTML =
      '<p class="px-6 py-4 text-sm text-gray-400">No task for today</p>';
  }
}

async function ProgressStatus() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const ProjectProgress = document.getElementById("projectprogress");
  const projectProgressSummary = document.getElementById(
    "projectprogress_summary",
  );

  if (!ProjectProgress || !projectProgressSummary) {
    return;
  }

  const getProgressMeta = (rawProgress) => {
    const progress = Math.max(0, Math.min(100, Number(rawProgress) || 0));

    if (progress >= 80) {
      return {
        text: "Excellent",
        barClass: "bg-emerald-500",
        chipClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      };
    }

    if (progress >= 50) {
      return {
        text: "Steady",
        barClass: "bg-sky-500",
        chipClass: "bg-sky-50 text-sky-700 border border-sky-100",
      };
    }

    return {
      text: "Needs focus",
      barClass: "bg-amber-500",
      chipClass: "bg-amber-50 text-amber-700 border border-amber-100",
    };
  };

  const renderSummary = (projects) => {
    const totalProjects = projects.length;
    const averageProgress = totalProjects
      ? Math.round(
          projects.reduce(
            (acc, project) =>
              acc +
              Math.max(0, Math.min(100, Number(project.progress_status) || 0)),
            0,
          ) / totalProjects,
        )
      : 0;
    const onTrackCount = projects.filter(
      (project) => (Number(project.progress_status) || 0) >= 50,
    ).length;

    projectProgressSummary.innerHTML = `
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
              <p class="text-[11px] uppercase tracking-wide text-sky-700">Avg Progress</p>
              <p class="mt-1 text-xl font-extrabold text-sky-900">${averageProgress}%</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <p class="text-[11px] uppercase tracking-wide text-emerald-700">On Track</p>
              <p class="mt-1 text-xl font-extrabold text-emerald-900">${onTrackCount}<span class="text-sm font-semibold text-emerald-700">/${totalProjects || 0}</span></p>
            </div>
          </div>
        `;
  };

  try {
    const response = await fetch(BASE_URL + "/dashboard/project-status", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      console.error("Invalid response", response.status);
      projectProgressSummary.innerHTML = `
                            <div class="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                                <p class="text-xs text-red-700 font-medium">Unable to load progress summary</p>
                            </div>
                        `;
      ProjectProgress.innerHTML =
        '<p class="py-2 text-sm text-gray-400">No progress data available</p>';
      return;
    }

    const data = await response.json();

    const projects = data.projects || [];
    renderSummary(projects);

    if (!projects.length) {
      ProjectProgress.innerHTML =
        '<p class="py-2 text-sm text-gray-400">No project progress yet</p>';
      return;
    }

    let html = "";

    projects.forEach((project) => {
      const title = project.project_title || "Untitled Project";
      const progress = Math.max(
        0,
        Math.min(100, Number(project.progress_status) || 0),
      );
      const meta = getProgressMeta(progress);

      html += `
            <article class="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">

                <div class="flex items-start justify-between gap-3 mb-2">
                    <p class="text-sm font-semibold text-gray-900 leading-5 line-clamp-2">${title}</p>
                    <span class="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${meta.chipClass}">${meta.text}</span>
                </div>

                <div class="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                    <span>Completion</span>
                    <span class="font-semibold text-gray-700">${progress}%</span>
                </div>

                <div class="w-full bg-gray-200/90 rounded-full h-2.5 overflow-hidden">

                    <div class="${meta.barClass} h-2.5 rounded-full transition-all duration-500"
                        style="width:${progress}%">
                    </div>

                </div>

            </article>
            `;
    });

    ProjectProgress.innerHTML = html;
  } catch (error) {
    console.error(error);
    projectProgressSummary.innerHTML = `
          <div class="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
            <p class="text-xs text-red-700 font-medium">Error loading progress summary</p>
          </div>
        `;
    ProjectProgress.innerHTML =
      '<p class="py-2 text-sm text-gray-400">Error loading progress</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  DashboardHeader();
  TodaysTask();
  ProgressStatus();
  loadUpcomingDeadlines();
});
