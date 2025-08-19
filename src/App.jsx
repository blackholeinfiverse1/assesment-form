import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Admin from "./pages/Admin";
import { SignInPage, SignUpPage } from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Intake from "./pages/Intake";
import Profile from "./pages/Profile";

export default function App() {
  return (
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
              <Intake />
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
  );
}
