import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", due_date: "" });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/task/`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setTasks(data.task || []);
    } catch (err) {
      toast.error("Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/task/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          id: String(currentTask.id),
          title: editForm.title,
          description: editForm.description,
          due_date: editForm.due_date,
        }),
      });
      if (!res.ok) throw new Error("Failed to edit task");
      toast.success("Task updated");
      setShowEditModal(false);
      loadTasks();
    } catch (err) {
      toast.error("Error editing task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/task/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ id: String(id) }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Task deleted");
      loadTasks();
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/task/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ id: String(id), status }),
      });
      if (!res.ok) throw new Error("Update failed");
      loadTasks();
    } catch (err) {
      toast.error("Task update error");
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring", "ring-coral/50");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("ring", "ring-coral/50");
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring", "ring-coral/50");
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  const columns = [
    { id: "todo", label: "To do", icon: <rect x="3" y="3" width="18" height="18" rx="2" />, iconColor: "text-navy/50" },
    { id: "in_progress", label: "In progress", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, iconColor: "text-amber-500" },
    { id: "completed", label: "Done", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, iconColor: "text-green-500" },
  ];

  const renderColumnContent = (status) => {
    const colTasks = tasks.filter(t => (t.status || "todo") === status);
    if (colTasks.length === 0) {
      return <p className="text-sm text-navy/50">No tasks in {status.replace("_", " ")}</p>;
    }
    return colTasks.map(task => (
      <div 
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        className="bg-surface/90 backdrop-blur-sm rounded-[1.25rem] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-glass-border/60 flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:shadow-[0_8px_20px_rgba(244,81,95,0.06)] hover:-translate-y-0.5 transition-all duration-300"
      >
        <h4 className="text-base font-extrabold text-navy mb-0.5 tracking-tight">{task.title || "Untitled task"}</h4>
        <p className="text-xs font-medium text-navy/60 leading-relaxed min-h-[30px]">{task.description || "No description provided."}</p>
        <div className="flex gap-2 mt-3 pt-3 border-t border-skin/60">
          <button 
            onClick={() => {
              setCurrentTask(task);
              setEditForm({ title: task.title || "", description: task.description || "", due_date: task.due_date ? task.due_date.split("T")[0] : "" });
              setShowEditModal(true);
            }} 
            className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-skin/50 text-coral hover:bg-coral hover:text-white transition-all duration-300"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDeleteTask(task.id)} 
            className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <header className="flex items-center justify-between bg-surface/60 backdrop-blur-xl px-8 py-5 border-b border-glass-border/40 sticky top-0 z-[5] shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coral to-coral-hover rounded-xl shadow-sm text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Tasks Board</h1>
        </div>
      </header>

      <main className="p-8 flex-1 overflow-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="bg-skin/70 rounded-2xl p-3 flex flex-col gap-3 flex-1">
                  <div className="bg-surface rounded-xl p-4 border border-skin">
                    <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse mb-3"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                    <div className="h-3 w-full bg-skin rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 h-full">
            {columns.map(col => (
              <div key={col.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${col.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {col.icon}
                  </svg>
                  <h3 className="text-sm font-bold text-navy/80">{col.label}</h3>
                </div>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="bg-skin/50 backdrop-blur-md rounded-[1.5rem] p-4 flex flex-col gap-4 flex-1 transition-all duration-300 border border-transparent hover:border-glass-border/50 shadow-inner"
                >
                  {renderColumnContent(col.id)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showEditModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-md bg-surface/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-glass-border/50 overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-skin/50 to-transparent border-b border-glass-border/40">
              <h3 className="text-xl font-extrabold text-navy tracking-tight">Edit Task</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-navy/50 hover:text-coral hover:bg-surface rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditTask} className="px-8 py-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Title</label>
                <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows="3" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all resize-none"></textarea>
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Due Date</label>
                <input type="date" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-skin/50">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl bg-surface border border-skin text-sm font-bold text-navy/70 hover:bg-skin hover:text-navy transition-all shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;

