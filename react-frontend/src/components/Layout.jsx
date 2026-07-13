import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const token = localStorage.getItem("token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-cream selection:bg-coral selection:text-white relative overflow-hidden">
      {/* Decorative abstract background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-coral/10 mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-skin mix-blend-multiply filter blur-[120px] opacity-80"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-coral/5 mix-blend-multiply filter blur-[80px] opacity-60"></div>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col ml-0 md:ml-[240px] relative z-10 min-h-screen pb-12 transition-all duration-300 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-surface/80 backdrop-blur-xl px-5 py-4 border-b border-glass-border/40 sticky top-0 z-[25] shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-bold text-navy tracking-tight">TaskMinder</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-navy/70 hover:text-coral hover:bg-surface rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;





