import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a professional loading indicator while Firebase resolves the auth state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#ffffff"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0, 212, 255, 0.2)",
          borderTop: "4px solid #00d4ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
          Verifying security state...
        </p>
      </div>
    );
  }

  // Redirect to Login if user is unauthenticated, saving original location for post-login return
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
