"use client";

import { signOut } from "next-auth/react";
import { Bell, Search, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { CommandPalette } from "./command-palette";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Topbar({ user }: TopbarProps) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition w-64"
        >
          <Search size={16} />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded border">{"\u2318"}K</kbd>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-auto">
                <div className="p-3 border-b border-gray-100 font-semibold text-sm">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-gray-50 ${n.read ? "" : "bg-blue-50"}`}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
                {user.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  getInitials(user.name || "U")
                )}
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <a href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={16} /> Profile
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
    </>
  );
}
