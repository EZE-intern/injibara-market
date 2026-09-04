import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../utils/authStorage";

function ProtectedCustomerRoute() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toUpperCase();

  if (role !== "CUSTOMER" && role !== "SELLER") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedCustomerRoute;