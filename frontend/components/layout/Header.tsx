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
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-medium">
        Workspace
      </div>

      <div className="flex items-center gap-4 text-sm">
        {email && (
          <span className="text-gray-600">
            {email}
          </span>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          className="text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
