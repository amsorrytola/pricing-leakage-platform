// frontend/components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse" />
          <span className="text-sm font-medium text-slate-600">Live Workspace</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {email && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">
              {email}
            </span>
          </div>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}