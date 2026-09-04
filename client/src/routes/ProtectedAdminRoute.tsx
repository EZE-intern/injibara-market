import { Navigate, Outlet } from "react-router-dom";

import {
  getToken,
  getUser,
} from "../utils/authStorage";

function ProtectedAdminRoute() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;