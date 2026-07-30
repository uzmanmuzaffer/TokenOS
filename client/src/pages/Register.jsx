import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      alert("Kayıt başarılı. Giriş yapabilirsiniz.");

      navigate("/login");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Register
        </p>

        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="mt-6 text-center text-gray-700">
          Already have an account?
          <Link
            to="/login"
            className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}