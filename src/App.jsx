import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Admin from "./pages/Admin";
import { SignInPage, SignUpPage } from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import IntakeWithBackground from "./pages/Intake";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
          <Route
            path="learn"
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            }
          />
          <Route
            path="intake"
            element={
              <ProtectedRoute>
                <IntakeWithBackground />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>

      {/* Toast notifications with custom styling */}
      <Toaster
        position="bottom-left"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
            boxShadow:
              "0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)",
          },
          // Success toasts
          success: {
            style: {
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#22c55e",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "rgba(34, 197, 94, 0.1)",
            },
          },
          // Error toasts
          error: {
            style: {
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "rgba(239, 68, 68, 0.1)",
            },
          },
          // Loading toasts
          loading: {
            style: {
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              color: "#f97316",
            },
            iconTheme: {
              primary: "#f97316",
              secondary: "rgba(249, 115, 22, 0.1)",
            },
          },
        }}
      />
    </>
  );
}
