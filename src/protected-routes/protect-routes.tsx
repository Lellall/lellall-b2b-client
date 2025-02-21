import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";


const ProtectedRoute = ({ isAdminRoute = false }) => {
  const { isAuthenticated, isAdmin } = useSelector(selectAuth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;