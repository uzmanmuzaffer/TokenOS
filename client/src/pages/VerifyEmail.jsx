import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

import PublicHeader from "../components/layout/PublicHeader";
import { useToast } from "../components/ui/Toast";

export default function VerifyEmail() {
  const { toast } = useToast();
  const location = useLocation();
  const presetEmail = location.state?.email || "";

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function resend(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user.emailVerified) {
        toast.success("Mail zaten doğrulanmış. Giriş yapabilirsin.");
        return;
      }

      await sendEmailVerification(result.user);
      await signOut(auth);
      toast.success("Yeni doğrulama maili gönderildi.");
    } catch (error) {
      toast.error(error.message || "Mail gönderilemedi.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-5 py-16">
        <form
          onSubmit={resend}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl"
        >
          <h1 className="text-center text-2xl font-semibold">Verify your email</h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-400">
            {email || "Hesabına"} adresine bir doğrulama linki gönderildi.
            Spam klasörüne de bak. Linke tıkladıktan sonra giriş yap.
          </p>

          <label className="mt-8 block text-sm text-slate-300">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mt-4 block text-sm text-slate-300">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-500 p-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend verification mail"}
          </button>

          <Link
            to="/login"
            className="mt-5 block text-center text-sm text-cyan-400 hover:text-cyan-300"
          >
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}