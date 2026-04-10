import { BASE_URL } from "./config.js";

const skeleton = document.getElementById("tasks_skeleton");
const board = document.getElementById("tasks_board");
const columns = {
  todo: document.getElementById("todo_column"),
  in_progress: document.getElementById("inprogress_column"),
  completed: document.getElementById("done_column"),
};

function setLoading(isLoading) {
  if (!skeleton || !board) return;
  skeleton.classList.toggle("hidden", !isLoading);
  board.classList.toggle("hidden", isLoading);
}

function renderEmpty(message) {
  Object.values(columns).forEach((col) => {
    if (!col) return;
    col.innerHTML = `<p class="text-sm text-gray-500">${message}</p>`;
  });
}

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2";
  card.setAttribute("draggable", "true");
  card.dataset.id = task.id;
  card.dataset.status = task.status;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    card.classList.add("opacity-50");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("opacity-50");
  });

  const title = document.createElement("h4");
  title.className = "text-sm font-semibold text-gray-900 mb-1";
  title.textContent = task.title || "Untitled task";

  const desc = document.createElement("p");
  desc.className = "text-sm text-gray-600 leading-relaxed";
  desc.textContent = task.description || "No description";

  // Edit & Delete buttons
  const btnRow = document.createElement("div");
  btnRow.className = "flex gap-2 mt-2";

  const editBtn = document.createElement("button");
  editBtn.className =
    "px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200";
  editBtn.textContent = "Edit";
  editBtn.onclick = () => openEditTaskModal(task);

  const deleteBtn = document.createElement("button");
  deleteBtn.className =
    "px-2 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => confirmDeleteTask(task.id);

  btnRow.appendChild(editBtn);
  btnRow.appendChild(deleteBtn);

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(btnRow);
  return card;
}

// Edit Task Modal
function openEditTaskModal(task) {
  let editTaskModal = null;
  if (editTaskModal) editTaskModal.remove();
  editTaskModal = document.createElement("div");
  editTaskModal.className =
    "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50";
  editTaskModal.innerHTML = `
    <div class='bg-white rounded-xl shadow-lg p-6 w-[350px]'>
      <h3 class='text-lg font-bold mb-4'>Edit Task</h3>
      <form id='editTaskForm' class='flex flex-col gap-3'>
        <input type='text' name='title' value="${task.title || ""}" placeholder='Title' class='border rounded px-2 py-1' required />
        <textarea name='description' placeholder='Description' class='border rounded px-2 py-1'>${task.description || ""}</textarea>
        <input type='date' name='due_date' value="${task.due_date ? task.due_date.split("T")[0] : ""}" class='border rounded px-2 py-1' />
        <div class='flex gap-2 mt-2'>
          <button type='submit' class='bg-blue-600 text-white px-3 py-1 rounded'>Save</button>
          <button type='button' class='bg-gray-200 text-gray-700 px-3 py-1 rounded' id='closeEditTaskModal'>Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(editTaskModal);
  document.getElementById("closeEditTaskModal").onclick = () =>
    editTaskModal.remove();

  document.getElementById("editTaskForm").onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const due_date = form.due_date.value;

    if (!title) {
      alert("Title is required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(BASE_URL + "/task/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          id: String(task.id),
          title,
          description,
          due_date,
        }),
      });

      if (!response.ok) {
        alert("Failed to edit task");
        return;
      }

      editTaskModal.remove();
      await loadTasks();
    } catch (err) {
      alert("Error editing task");
    }
  };
}

// Delete Task Confirmation
function confirmDeleteTask(id) {
  let deleteTaskModal = null;
  if (deleteTaskModal) deleteTaskModal.remove();
  deleteTaskModal = document.createElement("div");
  deleteTaskModal.className =
    "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50";
  deleteTaskModal.innerHTML = `
    <div class='bg-white rounded-xl shadow-lg p-6 w-[320px]'>
      <h3 class='text-lg font-bold mb-4'>Delete Task</h3>
      <p class='mb-4 text-sm text-gray-700'>Are you sure you want to delete this task?</p>
      <div class='flex gap-2'>
        <button class='bg-red-600 text-white px-3 py-1 rounded' id='confirmDeleteTaskBtn'>Delete</button>
        <button class='bg-gray-200 text-gray-700 px-3 py-1 rounded' id='cancelDeleteTaskBtn'>Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(deleteTaskModal);
  document.getElementById("cancelDeleteTaskBtn").onclick = () =>
    deleteTaskModal.remove();

  document.getElementById("confirmDeleteTaskBtn").onclick = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(BASE_URL + "/task/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ id: String(id) }),
      });

      if (!response.ok) {
        alert("Failed to delete task");
        return;
      }

      deleteTaskModal.remove();
      await loadTasks();
    } catch (err) {
      alert("Error deleting task");
    }
  };
}

function renderTasks(tasks) {
  Object.values(columns).forEach((col) => {
    if (col) col.innerHTML = "";
  });

  if (!tasks || tasks.length === 0) {
    renderEmpty("No tasks yet. Create one to get started.");
    return;
  }

  tasks.forEach((task) => {
    const status = task.status || "todo";
    const column = columns[status];
    const target = column || columns.todo;
    if (!target) return;
    target.appendChild(createTaskCard(task));
  });

  // Add drag-and-drop listeners to columns
  Object.entries(columns).forEach(([key, col]) => {
    if (!col) return;
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("ring", "ring-blue-300");
    });
    col.addEventListener("dragleave", () => {
      col.classList.remove("ring", "ring-blue-300");
    });
    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("ring", "ring-blue-300");
      const taskId = e.dataTransfer.getData("text/plain");
      if (!taskId) return;
      await updateTaskStatus(taskId, key);
    });
    if (col.children.length === 0) {
      col.innerHTML = `<p class="text-sm text-gray-400">No tasks in ${key.replace("_", " ")}</p>`;
    }
  });
}
async function updateTaskStatus(id, status) {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(BASE_URL + "/task/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ id: String(id), status }),
    });
    if (!response.ok) {
      console.error("Task update failed", response.status);
      return;
    }
    await loadTasks();
  } catch (error) {
    console.error("Task update error", error);
  }
}

async function loadTasks() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(BASE_URL + "/task/", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      console.error("Task fetch failed:", response.status);
      setLoading(false);
      renderEmpty("Unable to load tasks.");
      return;
    }

    const data = await response.json();
    const tasks = data.task || [];
    renderTasks(tasks);
  } catch (error) {
    console.error("Unable to load tasks:", error);
    renderEmpty("Unable to load tasks.");
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", loadTasks);
