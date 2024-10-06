import { Navigate } from "react-router-dom";
import { useAuth, useUser } from "./hooks";
import { ROUTES } from "src/routes";
import { ClosableToast } from "src/components/global/Toast";

// will give access to public routes if user is not authenticated
// otherwise will redirect to dashboard
export function PublicRoute({children}) {
    const isAuthenticated = useAuth()

    return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} /> : children
}

// will only give access to route if user is authenticated otherwise login page
export function PrivateRoute({children, allowedRoles}) {
    const isAuthenticated = useAuth()
    const {role} = useUser()
    const hasAccess = allowedRoles ? allowedRoles.includes(role) : true;

    if (!isAuthenticated) {
        ClosableToast("Your Session has been expired or not logged in currently!", "error", 2000)
        return <Navigate to={ROUTES.LOGIN} />
    }

    return hasAccess ? children : <Navigate to={ROUTES.UNAUTHORIZED} />
}

