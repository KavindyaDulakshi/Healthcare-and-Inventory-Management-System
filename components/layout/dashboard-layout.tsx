"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthcare } from "../../store/healthcare-context";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Dropdown, DropdownItem } from "../ui/dropdown";
import {
  LayoutDashboard,
  Pill,
  Truck,
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  BarChart3,
  Brain,
  Bell,
  History,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  LogOut,
  User,
  HeartPulse,
  Home,
  CheckCircle,
  AlertTriangle,
  X,
  Tags,
  Package
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Assistant", href: "/ai-assistant", icon: Brain },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Audit Logs", href: "/audit-logs", icon: History },
  { name: "Settings", href: "/settings", icon: Settings }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    logoutUser,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    medicines,
    patients,
    doctors
  } = useHealthcare();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: string; name: string; url: string }[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Auto redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Handle global search querying
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    // Search medicines
    medicines.forEach((m) => {
      if (m.name.toLowerCase().includes(query)) {
        results.push({ type: "Medicine", name: m.name, url: `/inventory?search=${encodeURIComponent(m.name)}` });
      }
    });

    // Search patients
    patients.forEach((p) => {
      if (p.name.toLowerCase().includes(query)) {
        results.push({ type: "Patient", name: p.name, url: `/patients?search=${encodeURIComponent(p.name)}` });
      }
    });

    // Search doctors
    doctors.forEach((d) => {
      if (d.name.toLowerCase().includes(query)) {
        results.push({ type: "Doctor", name: d.name, url: `/doctors?search=${encodeURIComponent(d.name)}` });
      }
    });

    setSearchResults(results.slice(0, 5));
  }, [searchQuery, medicines, patients, doctors]);

  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <HeartPulse className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  
  // Breadcrumbs builder
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      return { name, href, isLast: idx === parts.length - 1 };
    });
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight">MediCare</span>
              <span className="text-[10px] text-muted-foreground leading-none">Clinic Suite</span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="hidden sm:block relative w-full max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients, medicines, doctors..."
              className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
          </div>
          <AnimatePresence>
            {isSearchFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-12 left-0 right-0 bg-card border border-border rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1"
              >
                {searchResults.map((res, i) => (
                  <Link
                    key={i}
                    href={res.url}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/70 text-sm"
                  >
                    <span>{res.name}</span>
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      {res.type}
                    </span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Preferences & Alert Dropdown Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Notifications Dropdown */}
          <Dropdown
            align="right"
            className="w-80"
            trigger={
              <button className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-danger text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-card animate-bounce">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            }
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto p-1 flex flex-col gap-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No notifications</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={cn(
                      "p-2.5 rounded-lg text-left text-xs cursor-pointer transition-colors flex items-start gap-2",
                      n.read ? "hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {n.priority === "high" ? (
                      <AlertTriangle className="h-4.5 w-4.5 text-danger shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-4.5 w-4.5 text-secondary shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{n.title}</span>
                      <span className="text-muted-foreground leading-tight">{n.message}</span>
                      <span className="text-[9px] text-muted-foreground/80 mt-1">
                        {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border text-center">
              <Link
                href="/notifications"
                className="text-xs text-primary font-semibold hover:underline inline-block w-full"
              >
                View all notifications
              </Link>
            </div>
          </Dropdown>

          {/* User Profile Avatar Menu */}
          <Dropdown
            align="right"
            className="w-56"
            trigger={
              <div className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-90 cursor-pointer">
                <div className="bg-primary text-white font-bold h-9 w-9 rounded-xl flex items-center justify-center text-sm shadow-xs">
                  {currentUser.avatar}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-muted-foreground">{currentUser.role.split(" / ")[0]}</span>
                </div>
              </div>
            }
          >
            <div className="p-3 border-b border-border flex flex-col text-left">
              <span className="text-sm font-bold text-foreground leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-muted-foreground mt-1 truncate">{currentUser.email}</span>
            </div>
            <div className="p-1">
              <DropdownItem onClick={() => router.push("/settings")}>
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/settings?tab=preferences")}>
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </DropdownItem>
              <DropdownItem onClick={logoutUser} className="text-danger hover:bg-red-500/10">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </header>

      {/* Main Grid: Sidebar + Body */}
      <div className="flex-1 pt-16 flex relative">
        
        {/* Sidebar Container */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-card border-r border-border fixed top-16 bottom-0 left-0 z-20 transition-all duration-300",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group relative select-none",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-md shadow-blue-500/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:pl-4"
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", {
                    "text-white": isActive,
                    "text-muted-foreground group-hover:text-foreground": !isActive,
                    "group-hover:rotate-12 group-hover:scale-110": item.name !== "Settings" && item.name !== "Audit Logs",
                    "group-hover:rotate-90 group-hover:scale-110": item.name === "Settings",
                    "group-hover:scale-115 group-hover:-rotate-12": item.name === "Audit Logs"
                  })} />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed mode */}
                  {isSidebarCollapsed && (
                    <span className="absolute left-16 scale-0 rounded bg-foreground p-2 text-xs font-semibold text-background group-hover:scale-100 z-50 transition-all shadow-md">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Sidebar Collapse Button */}
          <div className="p-4 border-t border-border flex justify-end">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </aside>

        {/* Mobile Menu Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/45 dark:bg-black/65 z-40 md:hidden cursor-pointer"
              />
              
              {/* Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                className="glass-panel fixed top-0 bottom-0 left-0 w-72 bg-card/90 dark:bg-card/85 z-50 p-6 flex flex-col gap-6 shadow-2xl md:hidden border-r border-border"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-6 w-6 text-primary animate-pulse" />
                    <span className="font-bold text-lg tracking-tight">MediCare Menu</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-muted/80 border border-transparent hover:border-border cursor-pointer transition-all hover:rotate-90 duration-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search query..."
                    className="w-full bg-muted/60 rounded-xl pl-10 pr-4 py-2 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <nav className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-2">
                  {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-md shadow-blue-500/15"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:pl-4"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-border pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white font-bold h-10 w-10 rounded-xl flex items-center justify-center text-sm">
                      {currentUser.avatar}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold leading-tight">{currentUser.name}</span>
                      <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full gap-2 rounded-xl"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logoutUser();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Wrapper */}
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 min-h-[calc(100vh-4rem)] relative w-full",
            isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
          )}
        >
          {/* Top Info Bar: Breadcrumbs & Page Action Context */}
          <div className="px-6 pt-5 pb-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground overflow-hidden whitespace-nowrap">
              <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-[10px] text-muted-foreground/60 select-none">/</span>
                  <Link
                    href={crumb.href}
                    className={cn(
                      crumb.isLast
                        ? "text-foreground font-bold pointer-events-none"
                        : "hover:text-foreground"
                    )}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
            <div className="text-xs text-muted-foreground/80 font-medium">
              System Live Time: <span className="font-bold text-foreground">2026-06-09</span>
            </div>
          </div>

          {/* Main Slot Page Body */}
          <div className="flex-1 p-6 flex flex-col gap-6 bg-background">
            {children}
          </div>

          {/* Dashboard Footer */}
          <footer className="px-6 py-4 border-t border-border bg-card text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; 2026 Medicare Inc. All rights reserved. Hospital Suite Dashboard.</span>
            <div className="flex items-center gap-4">
              <Link href="/settings" className="hover:underline font-medium">Settings</Link>
              <Link href="/ai" className="hover:underline font-medium">AI Support</Link>
              <a href="#" className="hover:underline font-medium">Terms of Use</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
