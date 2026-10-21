import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import React from "react";
import { Link } from "react-router";
import { useSchool } from "@/context/SchoolContext";
import { MortarboardIcon } from "@/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSchool();

  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
        {children}
        <div className="hidden h-full w-full items-center bg-brand-950 lg:grid lg:w-1/2 dark:bg-white/5">
          <div className="relative z-1 flex items-center justify-center p-8">
            <GridShape />

            <div className="flex max-w-sm flex-col items-center text-center">
              <Link to="/school" className="mb-5 flex flex-col items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-theme-md">
                  <MortarboardIcon className="size-10" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {settings.schoolName}
                </h2>
              </Link>

              <p className="mb-6 text-sm text-gray-300 dark:text-white/70">
                {settings.tagline}
              </p>

              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white/90">
                  🏛️ {settings.currentCampus}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white/90">
                  📅 Session {settings.currentSession}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white/90">
                  ✨ Pre-Admission & RMS
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-e-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
