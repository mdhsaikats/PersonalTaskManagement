import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        toast.error("Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      toast.success("Login successful!");
      localStorage.setItem("token", data.token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen bg-cream selection:bg-coral selection:text-white">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-coral/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-skin rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-coral/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <img
          src="/gif/index_gif.gif"
          alt="Welcome illustration"
          className="w-full max-w-lg h-auto object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12 relative z-10">
        <div className="bg-surface/90 backdrop-blur-xl w-full max-w-md p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-glass-border/50 hover:shadow-[0_8px_30px_rgba(244,81,95,0.1)] transition-all duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-navy mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-navy/60 text-sm font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleLogin}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-semibold text-navy/80"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-navy/10 bg-surface/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-300"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-navy/80"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-navy/10 bg-surface/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-300"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-navy text-white font-bold text-sm tracking-wide py-4 rounded-xl hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-coral/20 transition-all duration-300 mb-8"
            >
              Sign In
            </button>

            <p className="text-center text-sm font-medium text-navy/70">
              Don't have an account?{" "}
              <Link
                to="/registration"
                className="font-bold text-coral hover:text-navy transition-colors duration-300"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

