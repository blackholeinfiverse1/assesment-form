import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-32 text-white">
      <div className="mx-auto w-full max-w-2xl text-center">
        <div className="card">
          <h1 className="text-3xl sm:text-4xl font-semibold">Gurukul</h1>
          <p className="text-white/80 text-base mt-2">
            Student intake powers Gurukul — our AI learning platform with
            agents. Your profile helps personalize your Seed → Tree → Sky path.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/intake" className="btn btn-primary px-6 py-3 text-base">
              Students
            </Link>
            <Link to="/admin" className="btn px-6 py-3 text-base">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
