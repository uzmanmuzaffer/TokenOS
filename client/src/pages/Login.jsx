import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import { useToast } from "../components/ui/Toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-5 py-16">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl"
        >
          <h1 className="text-center text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to open the TokenOS terminal
          </p>

          <label className="mt-8 block text-sm text-slate-300">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-500"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mt-4 block text-sm text-slate-300">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-500"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="mt-6 w-full rounded-xl bg-cyan-500 p-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            No account?
            <Link className="ml-2 text-cyan-400 hover:text-cyan-300" to="/register">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}