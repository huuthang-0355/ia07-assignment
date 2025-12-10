import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../utils/api";

const ProtectedRoute = () => {
    // Check if user has refresh token
    // Access token will be automatically refreshed by axios interceptor when needed
    const refreshToken = localStorage.getItem("refreshToken");
    const isAuthenticated = !!refreshToken;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
