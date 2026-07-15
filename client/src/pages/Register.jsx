
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
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Kayıt başarılı. Giriş yapabilirsiniz.");

      navigate("/login");

    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-xl w-96"
      >

        <h1 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h1>

        <input
          className="w-full border p-3 rounded mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-green-600 text-white p-3 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="mt-4 text-center">
          Already have an account?

          <Link
            className="text-blue-600 ml-2"
            to="/login"
          >
            Login
          </Link>

        </p>

      </form>

    </div>
  );
}

