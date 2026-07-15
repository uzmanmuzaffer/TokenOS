
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");

    } catch (error) {

      alert(error.message);

    }

    setLoading(false);
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">

      <div className="absolute top-10 text-center">
        <h1 className="text-4xl font-bold text-white">
          TokenOS
        </h1>

        <p className="text-gray-400 mt-2">
          AI-powered Web3 intelligence platform
        </p>
      </div>


      <form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-96"
      >

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>


        <input
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-gray-600 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />


        <input
          className="w-full mb-6 p-3 rounded-lg bg-white/10 border border-gray-600 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />


        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>


        <p className="text-gray-300 text-center mt-5">
          No account?

          <Link
            className="text-blue-400 ml-2"
            to="/register"
          >
            Register
          </Link>

        </p>

      </form>

    </div>
  );
}

