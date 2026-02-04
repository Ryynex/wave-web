import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If the user is not logged in, redirect them to the login page immediately
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the page they asked for (the child component)
  return children;
};

export default ProtectedRoute;
