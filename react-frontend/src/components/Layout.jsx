import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-cream selection:bg-coral selection:text-white relative overflow-hidden">
      {/* Decorative abstract background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-coral/10 mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-skin mix-blend-multiply filter blur-[120px] opacity-80"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-coral/5 mix-blend-multiply filter blur-[80px] opacity-60"></div>
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[240px] relative z-10 min-h-screen pb-12">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

