import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const PRIORITY_BADGE = {
  critical: "text-red-700 bg-red-50",
  high: "text-amber-700 bg-amber-50",
  normal: "text-coral bg-skin",
  overdue: "text-navy/80 bg-skin",
  unscheduled: "text-navy/60 bg-skin",
  invalid_date: "text-navy/60 bg-skin",
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_tasks: 0, completed: 0, in_progress: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [upcoming, setUpcoming] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  
  const [todaysTask, setTodaysTask] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: "Bearer " + token };

    // Fetch Stats
    fetch(BASE_URL + "/dashboard/header", { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setStats({
          total_tasks: data.total_tasks || 0,
          completed: data.completed || 0,
          in_progress: data.in_progress || 0
        });
      })
      .catch(() => console.error("Stats fetch failed"))
      .finally(() => setLoadingStats(false));

    // Fetch Today's Task
    fetch(BASE_URL + "/dashboard/todaystask", { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setTodaysTask(data.task_title || "No task for today");
      })
      .catch(() => setTodaysTask("No task for today"));

    // Fetch Project Progress
    fetch(BASE_URL + "/dashboard/project-status", { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProjects(data.projects || []))
      .catch(() => console.error("Projects fetch failed"))
      .finally(() => setLoadingProjects(false));

    // Fetch Upcoming Deadlines
    fetch(BASE_URL + "/dashboard/upcoming", { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUpcoming(data.upcoming || []))
      .catch(() => console.error("Upcoming fetch failed"))
      .finally(() => setLoadingUpcoming(false));
      
  }, [navigate]);

  const getProgressMeta = (rawProgress) => {
    const progress = Math.max(0, Math.min(100, Number(rawProgress) || 0));
    if (progress >= 80) return { text: "Excellent", barClass: "bg-emerald-500", chipClass: "bg-emerald-50 text-emerald-700 border border-emerald-100" };
    if (progress >= 50) return { text: "Steady", barClass: "bg-coral", chipClass: "bg-skin text-coral border border-coral/20" };
    return { text: "Needs focus", barClass: "bg-amber-500", chipClass: "bg-amber-50 text-amber-700 border border-amber-100" };
  };

  const avgProgress = projects.length 
    ? Math.round(projects.reduce((acc, p) => acc + Math.max(0, Math.min(100, Number(p.progress_status) || 0)), 0) / projects.length) 
    : 0;
  
  const onTrackCount = projects.filter(p => (Number(p.progress_status) || 0) >= 50).length;

  return (
    <>
      <header className="flex items-center gap-4 bg-surface/60 backdrop-blur-xl px-8 py-5 border-b border-glass-border/40 sticky top-0 z-[5] shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coral to-coral-hover rounded-xl shadow-sm text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Dashboard</h1>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          {[
            { label: "Total Tasks", value: stats.total_tasks, iconColor: "text-coral bg-skin/80", 
              icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
            { label: "In Progress", value: stats.in_progress, iconColor: "text-amber-600 bg-amber-100", 
              icon: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
            { label: "Completed", value: stats.completed, iconColor: "text-green-600 bg-green-100", 
              icon: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
          ].map((stat, i) => (
            <div key={i} className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-glass-border/60 hover:shadow-[0_8px_30px_rgba(244,81,95,0.08)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] ${stat.iconColor.split(' ')[1]} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${stat.iconColor.split(' ')[0]}`} viewBox="0 0 24 24" fill="none">
                      {stat.icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy/60">{stat.label}</p>
                    <div className="relative h-8 w-20 mt-1">
                      {loadingStats ? (
                        <span className="absolute left-0 top-1 h-6 w-16 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></span>
                      ) : (
                        <span className="text-3xl font-extrabold text-navy tracking-tight">{stat.value}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Upcoming Deadlines */}
          <div className="col-span-3 bg-surface/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-glass-border/60 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center px-7 py-6 border-b border-skin/60">
              <h2 className="text-xl font-extrabold text-navy tracking-tight">Upcoming Deadlines</h2>
              <Link to="/calendar" className="text-sm font-bold text-coral hover:text-coral-hover hover:underline transition-all">View Calendar</Link>
            </div>

            {loadingUpcoming ? (
              <div className="divide-y divide-gray-50">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-48 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="px-6 py-4 text-sm text-navy/60">No upcoming deadlines</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {upcoming.slice(0, 4).map((item, idx) => {
                  const priority = item.priority || "normal";
                  const badgeClass = PRIORITY_BADGE[priority] || PRIORITY_BADGE.normal;
                  return (
                    <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-skin/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin/80">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy">{item.title || "Untitled task"}</p>
                          <p className="text-xs text-navy/50 mt-0.5">Due {formatDate(item.due_date)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>{priority}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            {/* Today's Task */}
            <div className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-glass-border/60 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 px-7 py-6 border-b border-skin/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-extrabold text-navy tracking-tight">Todays Tasks</h2>
              </div>
              <div>
                {!todaysTask || todaysTask === "No task for today" ? (
                  <p className="px-6 py-4 text-sm text-navy/50">No task for today</p>
                ) : (
                  <div className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-skin0"></span>
                      <p className="text-sm font-medium text-navy">{todaysTask}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-glass-border/60 hover:shadow-lg transition-shadow duration-300">
              <div className="px-7 py-6 border-b border-skin/60 bg-gradient-to-br from-skin/80 to-cream/80 rounded-t-[1.5rem]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-coral font-bold">Overview</p>
                <h2 className="text-xl font-extrabold text-navy mt-1 tracking-tight">Project Progress</h2>
                <p className="text-xs font-medium text-navy/60 mt-1">Completion health across your active projects</p>
              </div>

              <div className="px-6 pt-5 pb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-coral/20 bg-skin px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-coral">Avg Progress</p>
                    <p className="mt-1 text-xl font-extrabold text-navy">{avgProgress}%</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-emerald-700">On Track</p>
                    <p className="mt-1 text-xl font-extrabold text-emerald-900">{onTrackCount}<span className="text-sm font-semibold text-emerald-700">/{projects.length || 0}</span></p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {loadingProjects ? (
                    <p className="py-2 text-sm text-navy/50">Loading...</p>
                  ) : projects.length === 0 ? (
                    <p className="py-2 text-sm text-navy/50">No project progress yet</p>
                  ) : (
                    projects.map((project, idx) => {
                      const title = project.project_title || "Untitled Project";
                      const progress = Math.max(0, Math.min(100, Number(project.progress_status) || 0));
                      const meta = getProgressMeta(progress);
                      return (
                        <article key={idx} className="rounded-xl border border-skin bg-skin/50/70 p-3.5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-navy leading-5 line-clamp-2">{title}</p>
                            <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${meta.chipClass}`}>{meta.text}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-navy/60 mb-1.5">
                            <span>Completion</span>
                            <span className="font-semibold text-navy/80">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200/90 rounded-full h-2.5 overflow-hidden">
                            <div className={`${meta.barClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

