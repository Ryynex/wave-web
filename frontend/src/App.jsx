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
import Profile from "./pages/Profile";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline"; // <--- Import
import Explorer from "./pages/Explorer"; // <--- Import
import ProtectedRoute from "./components/auth/ProtectedRoute";

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

            {/* NEW ROUTES */}
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
        </EncryptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
