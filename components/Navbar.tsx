"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const navItems = [
  { name: "Home", href: "/", icon: Trophy },
  { name: "Book Slots", href: "/slots", icon: Calendar },
  { name: "Admin", href: "/admin", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-cricket-green" />
              <span className="text-xl font-bold tracking-tight">
                {SITE_CONFIG.name.split(" ")[0]}{" "}
                <span className="text-cricket-green">
                  {SITE_CONFIG.name.split(" ").slice(1).join(" ")}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md font-medium transition-colors flex items-center space-x-2",
                    pathname === item.href
                      ? "text-cricket-green bg-cricket-green/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-zinc-900 border-t border-white/5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3",
                pathname === item.href
                  ? "text-cricket-green bg-cricket-green/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
