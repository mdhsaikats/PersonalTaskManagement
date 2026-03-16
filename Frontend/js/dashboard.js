import { BASE_URL } from "./config.js";

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
});