import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// <ProtectedRoute roles={["seller"]}> ... </ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-message">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.some((r) => user.roles.includes(r))) return <Navigate to="/" replace />;

  return children;
}