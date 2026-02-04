import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EncryptionProvider } from "./context/EncryptionContext"; // Add this wrapper
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReadEntry from "./pages/ReadEntry"; // New
import EditEntry from "./pages/EditEntry"; // New
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Assuming you have this from before

function App() {
  return (
    <Router>
      <AuthProvider>
        <EncryptionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </EncryptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
