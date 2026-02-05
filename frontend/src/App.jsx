import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EncryptionProvider } from "./context/EncryptionContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReadEntry from "./pages/ReadEntry";
import EditEntry from "./pages/EditEntry";
import Profile from "./pages/Profile"; // <--- Import
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <EncryptionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

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

            {/* NEW PROFILE ROUTE */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </EncryptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
