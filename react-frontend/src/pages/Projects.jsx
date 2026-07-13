import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

function statusMeta(status) {
  if (status === "1" || status === 1) {
    return { label: "Active", badge: "text-green-700 bg-green-100" };
  }
  return { label: "On Hold", badge: "text-amber-700 bg-amber-100" };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ title: "", description: "" });
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "1" });
  const [addTaskForm, setAddTaskForm] = useState({ title: "", description: "", dueDate: "" });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/project/`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setProjects(Array.isArray(data.project) ? data.project : []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/project/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error("Failed to create project");
      toast.success("Project created");
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "" });
      loadProjects();
    } catch (err) {
      toast.error("Unable to create project");
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/project/${currentProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Edit failed");
      toast.success("Project updated");
      setShowEditModal(false);
      loadProjects();
    } catch (err) {
      toast.error("Edit failed");
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Delete "${name}" ?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/project/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Project deleted");
      loadProjects();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/task/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          project_id: Number(currentProject.id),
          title: addTaskForm.title,
          description: addTaskForm.description,
          due_date: addTaskForm.dueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      toast.success("Task added");
      setShowAddTaskModal(false);
      setAddTaskForm({ title: "", description: "", dueDate: "" });
      loadProjects();
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  return (
    <>
      <header className="flex justify-between items-center bg-surface/60 backdrop-blur-xl px-5 md:px-8 py-5 border-b border-glass-border/40 sticky top-0 z-[5] shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Projects</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search projects..." className="bg-surface/80 border border-glass-border/60 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm w-[240px] focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent placeholder-navy/40 transition-all duration-300" />
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Active Projects</h2>
            <p className="text-sm font-medium text-navy/60 mt-1">Manage and track your ongoing workspace projects.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-brand-dark text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-coral hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-glass-border/60 shadow-sm p-7 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-200"></div>
                  <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                </div>
                <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-skin rounded-2xl p-6 text-center text-navy/60">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const { label, badge } = statusMeta(proj.status);
              const progress = Math.max(0, Math.min(100, Number(proj.project_progress) || 0));
              const createdText = formatDate(proj.created_at);
              const totalTasks = Math.max(0, Number(proj.total_task) || 0);

              return (
                <div key={proj.id} className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-glass-border/60 p-7 flex flex-col gap-4 group transition-all duration-500 hover:shadow-[0_8px_30px_rgba(244,81,95,0.08)] hover:-translate-y-1 relative">
                  <span className={`absolute top-5 right-5 text-[10px] font-bold ${badge} px-2.5 py-1 rounded-full uppercase tracking-wider transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none z-10`}>
                    {label}
                  </span>

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-skin to-cream shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-coral">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:pointer-events-auto">
                      <button onClick={() => { setCurrentProject(proj); setEditForm({ title: proj.title, description: proj.description, status: proj.status || "1" }); setShowEditModal(true); }} className="p-1.5 rounded-lg bg-skin/50 hover:bg-coral text-coral hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button onClick={() => handleDeleteProject(proj.id, proj.title)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-navy truncate tracking-tight">{proj.title || "Untitled project"}</h3>
                    <p className="text-sm font-medium text-navy/60 min-h-[40px] mt-1 leading-relaxed">{proj.description || "No description provided."}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold text-navy/50 py-3 border-t border-skin/60 mt-1">
                    <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {createdText}</span>
                    <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> {totalTasks} Tasks</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-coral mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-skin/80 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div className="bg-coral h-2.5 rounded-full" style={{ width: `${progress}%`, transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
                    </div>
                  </div>

                  <button onClick={() => { setCurrentProject(proj); setShowAddTaskModal(true); }} className="mt-2 w-full py-2.5 rounded-xl bg-skin text-coral font-bold text-sm hover:bg-coral hover:text-white transition-all duration-300">
                    + Add New Task
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-xl bg-surface/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-glass-border/50 overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="flex items-center justify-between px-5 md:px-8 py-5 bg-gradient-to-r from-skin/50 to-transparent border-b border-glass-border/40">
              <h3 className="text-xl font-extrabold text-navy tracking-tight">Create New Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-navy/50 hover:text-coral hover:bg-surface rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="px-8 py-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Project Name</label>
                <input required type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Enter project name" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Description</label>
                <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} rows="4" placeholder="Write a short project summary" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all resize-none"></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-skin/50">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl bg-surface border border-skin text-sm font-bold text-navy/70 hover:bg-skin hover:text-navy transition-all shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-bold hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 transition-all">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-md bg-surface/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-glass-border/50 overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="flex items-center justify-between px-5 md:px-8 py-5 bg-gradient-to-r from-skin/50 to-transparent border-b border-glass-border/40">
              <h3 className="text-xl font-extrabold text-navy tracking-tight">Edit Project</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-navy/50 hover:text-coral hover:bg-surface rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditProject} className="px-8 py-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Project Name</label>
                <input required type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows="4" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all resize-none"></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-skin/50">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl bg-surface border border-skin text-sm font-bold text-navy/70 hover:bg-skin hover:text-navy transition-all shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-bold hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-xl bg-surface/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-glass-border/50 overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="flex items-center justify-between px-5 md:px-8 py-5 bg-gradient-to-r from-skin/50 to-transparent border-b border-glass-border/40">
              <h3 className="text-xl font-extrabold text-navy tracking-tight">Add Task to {currentProject?.title}</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="p-2 text-navy/50 hover:text-coral hover:bg-surface rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="px-8 py-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Task Title</label>
                <input required type="text" value={addTaskForm.title} onChange={e => setAddTaskForm({ ...addTaskForm, title: e.target.value })} placeholder="Enter task title" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Description</label>
                <textarea value={addTaskForm.description} onChange={e => setAddTaskForm({ ...addTaskForm, description: e.target.value })} rows="4" placeholder="Write task details" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all resize-none"></textarea>
              </div>
              <div>
                <label className="text-sm font-bold text-navy/80 block mb-2">Due Date</label>
                <input type="date" value={addTaskForm.dueDate} onChange={e => setAddTaskForm({ ...addTaskForm, dueDate: e.target.value })} className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-skin/50">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-5 py-2.5 rounded-xl bg-surface border border-skin text-sm font-bold text-navy/70 hover:bg-skin hover:text-navy transition-all shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-bold hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 transition-all">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;






