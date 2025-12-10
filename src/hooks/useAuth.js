import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { setAccessToken, clearAccessToken } from "../utils/api";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials) => {
            // credentials: { email, password }
            const response = await api.post("/login", credentials);
            return response.data;
        },
        onSuccess: (data) => {
            // Server trả về accessToken và refreshToken
            setAccessToken(data.accessToken); // Lưu access token vào memory
            localStorage.setItem("refreshToken", data.refreshToken); // Lưu refresh token vào localStorage
            queryClient.setQueryData(["user"], data.user); // Cache user data
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error("Login failed:", error);
            // Error is handled in the component via error state
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Optionally call logout endpoint if available
            // await api.post("/logout");
        },
        onSuccess: () => {
            // Clear tokens and cache
            clearAccessToken();
            localStorage.removeItem("refreshToken");
            queryClient.clear(); // Clear all cached data
            queryClient.removeQueries(); // Remove all queries
            navigate("/login", { replace: true });
        },
        onError: () => {
            // Even if logout fails, clear local state
            clearAccessToken();
            localStorage.removeItem("refreshToken");
            queryClient.clear();
            queryClient.removeQueries();
            navigate("/login", { replace: true });
        },
    });
};
