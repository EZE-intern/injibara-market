import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../utils/authStorage";

function ProtectedSuperAdminRoute() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toUpperCase();

  if (role !== "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedSuperAdminRoute;