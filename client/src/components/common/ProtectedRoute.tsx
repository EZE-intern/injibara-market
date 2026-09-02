import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, getUser } from "../../utils/authStorage";

export interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

/**
 * ProtectedRoute component that verifies if a user is authenticated.
 * If not authenticated, immediately redirects to the login page before the page renders,
 * saving the current location for redirect-after-login support.
 *
 * Supports both layout route pattern (<Outlet />) and wrapper pattern ({children}).
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectPath = "/login",
}: ProtectedRouteProps) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
