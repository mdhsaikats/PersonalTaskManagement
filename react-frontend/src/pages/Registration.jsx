import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        toast.error("Registration failed. Please try again.");
        return;
      }

      toast.success("Registration successful!");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-12 relative overflow-hidden bg-cream selection:bg-coral selection:text-white">
      {/* Decorative background blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-coral/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-1/4 w-72 h-72 bg-skin rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="bg-surface/90 backdrop-blur-xl w-full max-w-md p-5 md:p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-glass-border/50 hover:shadow-[0_8px_30px_rgba(244,81,95,0.1)] transition-all duration-500 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-navy mb-3 tracking-tight">
            Create an Account
          </h1>
          <p className="text-navy/60 text-sm font-medium">
            Join us today! Please fill in your details.
          </p>
        </div>

        <form className="flex flex-col" onSubmit={handleRegistration}>
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

          <div className="mb-5">
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
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="w-full border border-navy/10 bg-surface/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-300"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-semibold text-navy/80"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="w-full border border-navy/10 bg-surface/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-300"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-dark text-white font-bold text-sm tracking-wide py-4 rounded-xl hover:bg-coral hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-coral/20 transition-all duration-300 mb-8"
          >
            Sign Up
          </button>

          <p className="text-center text-sm font-medium text-navy/70">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-coral hover:text-navy transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;






