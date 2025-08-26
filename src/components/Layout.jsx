import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { CLERK_ENABLED } from "../config/auth";
import { i18n, useI18n } from "../lib/i18n";

export default function Layout() {
  const [isAdmin, setIsAdmin] = React.useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("is_admin") === "1"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";

  // Language selection state using i18n
  const { t, lang } = useI18n();
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const langRefDesktop = React.useRef(null);
  const langRefMobile = React.useRef(null);
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
  ];

  React.useEffect(() => {
    const onClick = (e) => {
      const inDesktop = langRefDesktop.current && langRefDesktop.current.contains(e.target);
      const inMobile = langRefMobile.current && langRefMobile.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

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
          
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative" ref={langRefDesktop}>
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className="rounded-md px-3 py-1.5 text-sm border border-transparent hover:border-white/20 hover:bg-white/10 flex items-center gap-2"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen ? "true" : "false"}
                aria-label={t("nav.selectLanguage")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.94 9h-3.17a15.8 15.8 0 00-.77-4.02A8.02 8.02 0 0119.94 11zM12 4a13.9 13.9 0 011.9 5H10.1A13.9 13.9 0 0112 4zM8 5.98A15.8 15.8 0 007.23 11H4.06A8.02 8.02 0 018 5.98zM4.06 13h3.17c.16 1.39.5 2.74.99 3.98A8.02 8.02 0 014.06 13zM12 20a13.9 13.9 0 01-1.9-5h3.8A13.9 13.9 0 0112 20zm4-1.98A15.8 15.8 0 0016.77 13h3.17A8.02 8.02 0 0116 18.02zM8.94 13h6.12c-.15 1.37-.48 2.71-.98 3.94H9.92A17.9 17.9 0 018.94 13zm0-2c.15-1.37.48-2.71.98-3.94h4.16c.5 1.23.83 2.57.98 3.94H8.94z" />
                </svg>
                <span>
                  {languages.find((l) => l.code === lang)?.label || "English"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-white/20 bg-black/60 backdrop-blur-md shadow-lg">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        i18n.setLang(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${lang === l.code ? "bg-white/10" : ""}`}
                      role="option"
                      aria-selected={lang === l.code ? "true" : "false"}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="rounded-md bg-red-500 px-3 py-1.5 text-sm hover:bg-red-600"
              >
                {t("nav.logoutAdmin")}
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
                        {t("nav.dashboard")}
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
                        {t("nav.intake")}
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
                        {t("nav.assignment")}
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
          {/* Mobile controls: language + menu */}
          <div className="md:hidden flex items-center gap-2">
            <div className="relative" ref={langRefMobile}>
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className="rounded-md p-2 text-white hover:bg-white/10 border border-transparent hover:border-white/20 flex items-center gap-2"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen ? "true" : "false"}
                aria-label={t("nav.selectLanguage")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.94 9h-3.17a15.8 15.8 0 00-.77-4.02A8.02 8.02 0 0119.94 11zM12 4a13.9 13.9 0 011.9 5H10.1A13.9 13.9 0 0112 4zM8 5.98A15.8 15.8 0 007.23 11H4.06A8.02 8.02 0 018 5.98zM4.06 13h3.17c.16 1.39.5 2.74.99 3.98A8.02 8.02 0 014.06 13zM12 20a13.9 13.9 0 01-1.9-5h3.8A13.9 13.9 0 0112 20zm4-1.98A15.8 15.8 0 0016.77 13h3.17A8.02 8.02 0 0116 18.02zM8.94 13h6.12c-.15 1.37-.48 2.71-.98 3.94H9.92A17.9 17.9 0 018.94 13zm0-2c.15-1.37.48-2.71.98-3.94h4.16c.5 1.23.83 2.57.98 3.94H8.94z" />
                </svg>
                <span className="text-sm">{languages.find((l) => l.code === lang)?.label || "English"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-white/20 bg-black/60 backdrop-blur-md shadow-lg">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        i18n.setLang(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${lang === l.code ? "bg-white/10" : ""}`}
                      role="option"
                      aria-selected={lang === l.code ? "true" : "false"}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isHome && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-md p-2 text-white hover:bg-white/10"
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
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {!isHome && isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            {isAdmin ? (
              <div className="p-4 space-y-3">

                <button
                  onClick={handleAdminLogout}
                  className="w-full rounded-md bg-red-500 px-3 py-1.5 text-sm hover:bg-red-600"
                >
                  {t("nav.logoutAdmin")}
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
                      {t("nav.dashboard")}
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
                      {t("nav.intake")}
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
                      {t("nav.assignment")}
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
