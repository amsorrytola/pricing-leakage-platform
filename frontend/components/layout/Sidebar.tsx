// frontend/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { 
    name: "Dashboard", 
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    name: "Clients", 
    href: "/clients",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    name: "Contracts", 
    href: "/contracts",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    name: "Pricing Catalogue", 
    href: "/pricing-catalogue",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col shadow-sm flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-none">Pricing</span>
            <span className="text-xs text-slate-500 leading-none mt-0.5">Intelligence</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200/60">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Revenue Intelligence</span>
        </div>
      </div>
    </aside>
  );
}