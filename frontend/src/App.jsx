import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EncryptionProvider } from "./context/EncryptionContext";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReadEntry from "./pages/ReadEntry";
import EditEntry from "./pages/EditEntry";
import Profile from "./pages/Profile";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline";
import Explorer from "./pages/Explorer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute"; // <--- Import this

function App() {
  return (
    <Router>
      <AuthProvider>
        <EncryptionProvider>
          <ToastProvider>
            <Routes>
              {/* --- WRAP LOGIN IN PUBLIC ROUTE --- */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes (Keep as is) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/entry/:id"
                element={
                  <ProtectedRoute>
                    <ReadEntry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditEntry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <EditEntry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <Timeline />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Explorer />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ToastProvider>
        </EncryptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
