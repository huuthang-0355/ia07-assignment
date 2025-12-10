import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { useLogout } from "../hooks/useAuth";

const Dashboard = () => {
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    // Fetch user info from protected endpoint
    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await api.get("/me");
            return res.data;
        },
        retry: false, // Don't retry on auth errors - let interceptor handle it
    });

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <div className="loading-container">
                    <div className="spinner-large"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="error-container">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="error-icon-large"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <h2>Error loading profile</h2>
                    <p>
                        {error.response?.data?.message ||
                            error.message ||
                            "Something went wrong"}
                    </p>
                    <button onClick={() => logout()} className="btn-secondary">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <h2>Dashboard</h2>
                </div>
                <button
                    onClick={() => logout()}
                    className="logout-button"
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <>
                            <div className="spinner-small"></div>
                            Logging out...
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 8.414V14h10V7.414zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                />
                                <path d="M15.707 10.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L12 12.586l2.293-2.293a1 1 0 011.414 0z" />
                            </svg>
                            Logout
                        </>
                    )}
                </button>
            </nav>

            <main className="dashboard-content">
                <div className="welcome-card">
                    <div className="welcome-header">
                        <div className="avatar">
                            <span>
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                        </div>
                        <div className="welcome-text">
                            <h1>Welcome back, {user?.name || "User"}!</h1>
                            <p>Here's your profile information</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="info-card">
                        <div className="info-card-header">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="card-icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <h3>Email Address</h3>
                        </div>
                        <p className="info-value">{user?.email || "N/A"}</p>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="card-icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h3>Full Name</h3>
                        </div>
                        <p className="info-value">{user?.name || "N/A"}</p>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="card-icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h3>User ID</h3>
                        </div>
                        <p className="info-value">#{user?.id || "N/A"}</p>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="card-icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h3>Role</h3>
                        </div>
                        <p className="info-value">
                            <span className="role-badge">
                                {user?.role || "user"}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="security-card">
                    <div className="security-header">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="security-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <h3>Security Information</h3>
                    </div>
                    <p className="security-text">
                        Your access token is securely stored in memory and
                        automatically refreshed when needed. Your refresh token
                        is stored securely in your browser's local storage.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
