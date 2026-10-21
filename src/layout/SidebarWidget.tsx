import { useSchool } from "@/context/SchoolContext";
import { Link } from "react-router";

export default function SidebarWidget() {
  const { settings } = useSchool();

  return (
    <div className="pb-20">
      <div className="mx-auto w-full max-w-60 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-center dark:border-gray-800 dark:bg-white/5">
        <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 dark:bg-brand-500/20">
          🏛️
        </div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
          {settings.currentCampus}
        </h3>
        <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
          Session {settings.currentSession}
        </p>
        <Link
          to="/school/settings"
          className="mt-3 flex items-center justify-center rounded-lg bg-brand-500 px-3 py-2 text-theme-xs font-medium text-white transition hover:bg-brand-600"
        >
          ⚙️ School Settings
        </Link>
      </div>
    </div>
  );
}
