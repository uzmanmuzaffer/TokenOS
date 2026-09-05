
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AirdropRadar from "./pages/AirdropRadar";
import Earn from "./pages/Earn";
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/analyze" element={<Analyze />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/developers" element={<Developers />} />

          {/* Landing Page Anchors */}
          <Route path="/features" element={<Home />} />
          <Route path="/how-it-works" element={<Home />} />

          {/* Analyzer Alias */}
          <Route
            path="/analyzer"
            element={<Navigate to="/analyze" replace />}
          />

          {/* Protected Routes */}
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
            path="/earn"
            element={
              <ProtectedRoute>
                <Earn />
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

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/analyze" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

