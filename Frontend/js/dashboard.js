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
        updateStatValue("completed_task", "completed_task_skeleton", data.completed);
        updateStatValue("in_progress_task", "in_progress_task_skeleton", data.in_progress);
    } catch (error) {
        console.error("Unable to load dashboard stats:", error);
        showStatFallback();
    }
}

async function TodaysTask(){
    const token = localStorage.getItem("token");
    if (!token){
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
            todaysTaskEl.innerHTML = '<p class="px-6 py-4 text-sm text-gray-400">No task for today</p>';
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
        todaysTaskEl.innerHTML = '<p class="px-6 py-4 text-sm text-gray-400">No task for today</p>';
    }
}

async function ProgressStatus() {

    const token = localStorage.getItem("token");

    if (!token){
        window.location.href = "index.html";
        return;
    }

    const ProjectProgress = document.getElementById("projectprogress");

    if (!ProjectProgress){
        return;
    }

    try{

        const response = await fetch(BASE_URL + "/dashboard/project-status",{
            method: "GET",
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if(!response.ok){
            console.error("Invalid response",response.status);
            ProjectProgress.innerHTML = "<p>No Progress</p>";
            return;
        }

        const data = await response.json();

        const projects = data.projects || [];

        let html = "";

        projects.forEach(project => {

            const title = project.project_title;
            const progress = parseFloat(project.progress_status);

            html += `
            <div class="bg-white p-4 rounded-lg shadow mb-4">

                <div class="flex justify-between mb-2">
                    <span class="font-medium">${title}</span>
                    <span class="text-sm text-gray-500">${progress}%</span>
                </div>

                <div class="w-full bg-gray-200 rounded-full h-4">

                    <div class="bg-blue-500 h-4 rounded-full transition-all duration-500"
                        style="width:${progress}%">
                    </div>

                </div>

            </div>
            `;
        });

        ProjectProgress.innerHTML = html;

    }catch(error){
        console.error(error);
        ProjectProgress.innerHTML = "<p>Error loading progress</p>";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    DashboardHeader();
    TodaysTask();
    ProgressStatus();
    loadUpcomingDeadlines();
});