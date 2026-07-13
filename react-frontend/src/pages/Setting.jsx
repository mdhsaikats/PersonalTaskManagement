import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

const Setting = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${BASE_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        if (data && data.email) setEmail(data.email);
      } catch (err) {
        toast.error("Unable to load email");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  return (
    <>
      <header className="flex justify-between items-center bg-surface/60 backdrop-blur-xl px-8 py-5 border-b border-glass-border/40 sticky top-0 z-[5] shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coral to-coral-hover rounded-xl shadow-sm text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Settings</h1>
        </div>
        <button className="bg-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-coral hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          Save Changes
        </button>
      </header>

      <main className="p-8 space-y-6 flex-1 overflow-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <section className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-glass-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 p-8">
              <h2 className="text-xl font-extrabold text-navy tracking-tight">Profile Information</h2>
              <p className="text-sm font-medium text-navy/60 mt-1">Update your account details and contact information.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="text-sm font-bold text-navy/80 block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={loading ? "Loading..." : "Email unavailable"}
                    className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all"
                  />
                </div>
              </div>
            </section>

            <section className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-glass-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 p-8">
              <h2 className="text-xl font-extrabold text-navy tracking-tight">Security</h2>
              <p className="text-sm font-medium text-navy/60 mt-1">Manage password and authentication preferences.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="text-sm font-bold text-navy/80 block mb-2">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-navy/80 block mb-2">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full bg-surface/50 px-4 py-3.5 border border-navy/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-skin/50 border border-skin/60 px-5 py-4">
                <div>
                  <p className="text-sm font-extrabold text-navy">Two-factor authentication</p>
                  <p className="text-xs font-medium text-navy/60 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <button className="px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-md bg-surface/80 text-coral border border-coral/20 shadow-sm cursor-not-allowed">
                  COMING SOON
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-glass-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 p-8">
              <h2 className="text-xl font-extrabold text-navy tracking-tight">Appearance</h2>
              <p className="text-sm font-medium text-navy/60 mt-1">Customize the interface theme.</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { id: 'light', label: 'Light', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                  { id: 'dark', label: 'Dark', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
                  { id: 'system', label: 'System', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
                ].map(themeOpt => {
                  const isActive = theme === themeOpt.id || (!theme && themeOpt.id === 'system');
                  return (
                    <button
                      key={themeOpt.id}
                      onClick={() => handleThemeChange(themeOpt.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        isActive 
                          ? 'bg-skin/50 border-coral text-coral shadow-inner ring-1 ring-coral/50' 
                          : 'bg-surface/50 border-skin/60 text-navy/60 hover:bg-skin hover:text-navy hover:border-skin'
                      }`}
                    >
                      {themeOpt.icon}
                      <span className="text-sm font-bold">{themeOpt.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default Setting;

