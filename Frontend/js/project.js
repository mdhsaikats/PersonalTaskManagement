import { BASE_URL } from "./config.js";

// expose for non-module scripts
window.BASE_URL = BASE_URL;

const projectGrid = document.getElementById("project_grid");
const projectSkeleton = document.getElementById("project_skeleton");

// -------------------- Helpers --------------------

function statusMeta(status) {
  if (status === "1") {
    return { label: "Active", badge: "text-green-700 bg-green-100" };
  }
  return { label: "On Hold", badge: "text-amber-700 bg-amber-100" };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function setLoading(show) {
  if (projectSkeleton) projectSkeleton.classList.toggle("hidden", !show);
  if (projectGrid) projectGrid.classList.toggle("opacity-40", show);
}

// -------------------- Render --------------------


function renderProjects(projects) {
  if (!projectGrid) return;
  if (!Array.isArray(projects) || projects.length === 0) {
    projectGrid.innerHTML = `
      <div class="col-span-3 bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-500">
        No projects found.
      </div>
    `;
    return;
  }


  const cards = projects.map((proj) => {
    const pid = proj.id ?? "";
    const { label, badge } = statusMeta(proj.status);
    const progress = Math.max(0, Math.min(100, Number(proj.project_progress) || 0));
    const createdText = formatDate(proj.created_at);
    const totalTasks = Math.max(0, Number(proj.total_task) || 0);



    return `
      <div class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 group transition-all duration-200 hover:border-blue-400 relative"
           data-project-id="${pid}">

        <span class="project-status-badge absolute top-4 right-4 text-xs font-semibold ${badge} px-2 py-0.5 rounded-full uppercase transition group-hover:opacity-0 group-hover:pointer-events-none z-10">
          ${label}
        </span>

        <div class="flex items-center justify-between mb-1">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500 hover:text-indigo-500 transition-colors duration-200">
  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
</svg>
          </div>

          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition group-hover:pointer-events-auto">
            <button class="editProjectBtn p-1 rounded hover:bg-blue-50 text-blue-600"
                    data-project-id="${pid}"
                    data-project-name="${proj.title || "Project"}"
                    data-project-desc="${proj.description || ""}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500 hover:text-blue-500 transition-colors duration-200">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
</svg>
            </button>

            <button class="deleteProjectBtn p-1 rounded hover:bg-red-50 text-red-600"
                    data-project-id="${pid}"
                    data-project-name="${proj.title || "Project"}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500 hover:text-red-500 transition-colors duration-200">
  <path d="M3 6h18" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  <line x1="10" y1="11" x2="10" y2="17" />
  <line x1="14" y1="11" x2="14" y2="17" />
</svg>
            </button>
          </div>
        </div>

        <h3 class="text-base font-bold text-gray-900 truncate">
          ${proj.title || "Untitled project"}
        </h3>

        <p class="text-xs text-gray-500 min-h-[32px]">
          ${proj.description || "No description"}
        </p>

        <div class="flex justify-between text-[11px] text-gray-400">
          <span>Created: ${createdText}</span>
          <span>Tasks: ${totalTasks}</span>
        </div>

        <div>
          <div class="flex justify-between text-[11px] text-blue-700">
            <span>Progress</span>
            <span>${progress}%</span>
          </div>

          <div class="w-full bg-gray-100 rounded h-2">
            <div class="bg-blue-500 h-2 rounded"
                 style="width: ${progress}%; transition: width 0.4s;">
            </div>
          </div>
        </div>

        <button class="addTaskBtn mt-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
                data-project-id="${pid}"
                data-project-name="${proj.title || 'Project'}">
          + Add Task
        </button>

      </div>
    `;
  });

  projectGrid.innerHTML = cards.join("");
}

// -------------------- Events (Delegation) --------------------

function setupEventDelegation() {
  if (!projectGrid) return;

  projectGrid.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".editProjectBtn");
    const deleteBtn = e.target.closest(".deleteProjectBtn");
    const addTaskBtn = e.target.closest(".addTaskBtn");

    // -------- EDIT --------
    if (editBtn) {
      const pid = editBtn.dataset.projectId;
      const pname = editBtn.dataset.projectName;
      const pdesc = editBtn.dataset.projectDesc;
      openEditProjectModal(pid, pname, pdesc);
    }

    // -------- ADD TASK --------
    if (addTaskBtn) {
      const pid = addTaskBtn.dataset.projectId;
      const pname = addTaskBtn.dataset.projectName;
      openAddTaskModal(pid, pname);
    }
// Add Task Modal logic
function openAddTaskModal(projectId, projectName) {
  const modal = document.getElementById("addProjectTaskModal");
  if (!modal) return;
  modal.style.display = "flex";
  document.getElementById("selectedProjectId").value = projectId;
  document.getElementById("addProjectTaskModalTitle").textContent = `Add Task to ${projectName}`;

  // Clear fields
  document.getElementById("projectTaskTitle").value = "";
  document.getElementById("projectTaskDescription").value = "";
  document.getElementById("projectTaskDueDate").value = "";

  // Close/cancel logic
  document.getElementById("closeAddProjectTaskModal").onclick = () => {
    modal.style.display = "none";
  };
  document.getElementById("cancelAddProjectTask").onclick = () => {
    modal.style.display = "none";
  };
}

// Add Task form submit logic
document.addEventListener("DOMContentLoaded", () => {
  const addTaskForm = document.getElementById("addProjectTaskForm");
  if (addTaskForm) {
    addTaskForm.onsubmit = async function (e) {
      e.preventDefault();
      const projectId = document.getElementById("selectedProjectId").value;
      const title = document.getElementById("projectTaskTitle").value;
      const description = document.getElementById("projectTaskDescription").value;
      const dueDate = document.getElementById("projectTaskDueDate").value;
      await addTaskToProject(projectId, title, description, dueDate);
      document.getElementById("addProjectTaskModal").style.display = "none";
    };
  }
});

// Add Task API
async function addTaskToProject(projectId, title, description, dueDate) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/task/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        project_id: Number(projectId),
        title,
        description,
        due_date: dueDate,
      }),
    });
    if (!res.ok) {
      alert("Failed to add task");
      return;
    }
    loadProjects(); // refresh project/task counts
  } catch (err) {
    console.error("Add task error:", err);
  }
}
// Modal logic for editing project
function openEditProjectModal(id, name, desc) {
  let modal = document.getElementById("editProjectModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "editProjectModal";
    modal.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Edit Project</h3>
          <button id="closeEditProjectModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="editProjectForm" class="px-6 py-5 space-y-4">
          <div>
            <label for="editProjectName" class="text-sm font-medium text-gray-700">Project Name</label>
            <input id="editProjectName" name="editProjectName" type="text" required class="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label for="editProjectDescription" class="text-sm font-medium text-gray-700">Description</label>
            <textarea id="editProjectDescription" name="editProjectDescription" rows="4" class="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" id="cancelEditProject" class="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  // Fill fields
  document.getElementById("editProjectName").value = name;
  document.getElementById("editProjectDescription").value = desc;

  // Close modal
  document.getElementById("closeEditProjectModal").onclick = () => {
    modal.style.display = "none";
  };
  document.getElementById("cancelEditProject").onclick = () => {
    modal.style.display = "none";
  };

  // Submit edit
  document.getElementById("editProjectForm").onsubmit = function (e) {
    e.preventDefault();
    const newName = document.getElementById("editProjectName").value;
    const newDesc = document.getElementById("editProjectDescription").value;
    editProject(id, newName, newDesc, "1");
    modal.style.display = "none";
  };
}
// Edit project API
async function editProject(id, title, description, status) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/project/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title, description, status }),
    });
    if (!res.ok) {
      alert("Edit failed");
      return;
    }
    loadProjects();
  } catch (err) {
    console.error("Edit error:", err);
  }
}

    // -------- DELETE --------
    if (deleteBtn) {
      const pid = deleteBtn.dataset.projectId;
      const pname = deleteBtn.dataset.projectName;

      console.log("Delete clicked:", pid);

      const confirmDelete = confirm(`Delete "${pname}" ?`);
      if (!confirmDelete) return;

      deleteProject(pid);
    }
  });
}

// -------------------- API --------------------

async function deleteProject(id) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/project/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    // reload after delete
    loadProjects();

  } catch (err) {
    console.error("Delete error:", err);
  }
}

// -------------------- Load --------------------

async function loadProjects() {
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "index.html";
      return;
    }

    const res = await fetch(`${BASE_URL}/project/`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      console.error("Fetch failed:", res.status);
      renderProjects([]);
      return;
    }

    const data = await res.json();
    const projects = Array.isArray(data.project) ? data.project : [];

    renderProjects(projects);

  } catch (err) {
    console.error("Unable to load projects", err);
    renderProjects([]);
  } finally {
    setLoading(false);
  }
}

// -------------------- Init --------------------

document.addEventListener("DOMContentLoaded", () => {
  setupEventDelegation(); // 🔥 only once
  loadProjects();
});