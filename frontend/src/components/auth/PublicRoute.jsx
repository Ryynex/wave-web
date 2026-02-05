import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If the user IS logged in, they shouldn't see the login page.
  // Redirect them to the Dashboard immediately.
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  // If they are NOT logged in, let them see the page (Login).
  return children;
};

export default PublicRoute;
