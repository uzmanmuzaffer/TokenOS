import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AirdropRadar from "./pages/AirdropRadar";
import Analyze from "./pages/Analyze";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import Developers from "./pages/Developers";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/features" element={<Home />} />
          <Route path="/how-it-works" element={<Home />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/airdrop-radar"
            element={
              <ProtectedRoute>
                <AirdropRadar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;