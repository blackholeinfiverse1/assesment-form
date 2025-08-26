import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { CLERK_ENABLED } from "../config/auth";

export default function Layout() {
  const [isAdmin, setIsAdmin] = React.useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("is_admin") === "1"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";

  // Listen for changes to sessionStorage to update admin state
  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(sessionStorage.getItem("is_admin") === "1");
    };

    // Listen for storage events (when sessionStorage changes in other tabs/windows)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes in the same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleAdminLogout = () => {
    sessionStorage.removeItem("is_admin");
    setIsAdmin(false);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/blackhole-logo.png"
              alt="Blackhole logo"
              className="h-10 w-auto sm:h-12"
            />
            <Link to="/" className="text-lg sm:text-xl font-semibold">
              Gurukul
            </Link>
          </div>
          
          {/* Mobile menu button */}
          {!isHome && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-md p-2 text-white hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          {/* Desktop navigation */}
          <div className="hidden md:block">
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="rounded-md bg-red-500 px-3 py-1.5 text-sm hover:bg-red-600"
              >
                Logout (Admin)
              </button>
            ) : (
              CLERK_ENABLED && (
                <>
                  <SignedIn>
                    <div className="flex items-center gap-2">
                      <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                          `rounded-md px-3 py-1.5 text-sm ${
                            isActive
                              ? "bg-white/20 border border-white/30"
                              : "border border-transparent hover:border-white/20 hover:bg-white/10"
                          }`
                        }
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="/intake"
                        className={({ isActive }) =>
                          `rounded-md px-3 py-1.5 text-sm ${
                            isActive
                              ? "bg-white/20 border border-white/30"
                              : "border border-transparent hover:border-white/20 hover:bg-white/10"
                          }`
                        }
                      >
                        Intake
                      </NavLink>
                      <NavLink
                        to="/assignment"
                        className={({ isActive }) =>
                          `rounded-md px-3 py-1.5 text-sm ${
                            isActive
                              ? "bg-white/20 border border-white/30"
                              : "border border-transparent hover:border-white/20 hover:bg-white/10"
                          }`
                        }
                      >
                        Assignment
                      </NavLink>
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonBox:
                              "rounded-md bg-white/10 hover:bg-white/20",
                          },
                        }}
                        afterSignOutUrl="/"
                      />
                    </div>
                  </SignedIn>
                  <SignedOut>
                    {/* No sign-in button in navbar - users can access sign-in through dedicated buttons on home page */}
                  </SignedOut>
                </>
              )
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {!isHome && isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            {isAdmin ? (
              <div className="p-4">
                <button
                  onClick={handleAdminLogout}
                  className="w-full rounded-md bg-red-500 px-3 py-1.5 text-sm hover:bg-red-600"
                >
                  Logout (Admin)
                </button>
              </div>
            ) : (
              CLERK_ENABLED && (
                <SignedIn>
                  <div className="space-y-2 p-4">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full rounded-md px-3 py-1.5 text-sm ${
                          isActive
                            ? "bg-white/20 border border-white/30"
                            : "border border-transparent hover:border-white/20 hover:bg-white/10"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/intake"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full rounded-md px-3 py-1.5 text-sm ${
                          isActive
                            ? "bg-white/20 border border-white/30"
                            : "border border-transparent hover:border-white/20 hover:bg-white/10"
                        }`
                      }
                    >
                      Intake
                    </NavLink>
                    <NavLink
                      to="/assignment"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full rounded-md px-3 py-1.5 text-sm ${
                          isActive
                            ? "bg-white/20 border border-white/30"
                            : "border border-transparent hover:border-white/20 hover:bg-white/10"
                        }`
                      }
                    >
                      Assignment
                    </NavLink>
                    <div className="pt-2">
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonBox:
                              "rounded-md bg-white/10 hover:bg-white/20",
                          },
                        }}
                        afterSignOutUrl="/"
                      />
                    </div>
                  </div>
                </SignedIn>
              )
            )}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
