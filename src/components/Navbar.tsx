'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Search,
  Menu,
  X,
  FlaskConical,
  LayoutDashboard,
  Map,
  CheckCircle2,
  BookMarked,
  Cloud,
  LogIn,
} from 'lucide-react';
import { LESSONS } from '@/data/catalog';
import { useProgress } from '@/context/ProgressContext';
import dynamic from 'next/dynamic';

// Both dialogs load on first open. Search pulls in the playbook data, so keeping it
// out of the navbar bundle keeps that data off every page.
const SearchModal = dynamic(() => import('./SearchModal').then((m) => m.SearchModal), { ssr: false });
const AuthModal = dynamic(() => import('./AuthModal').then((m) => m.AuthModal), { ssr: false });

export function Navbar() {
  const pathname = usePathname();
  const { completedLessons, hydrated, user, syncStatus } = useProgress();
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const totalCount = LESSONS.length;
  const completedCount = hydrated ? completedLessons.length : 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const navLinks = [
    { href: '/paths', label: 'All Paths', icon: Map },
    { href: '/labs', label: 'AI PM Labs', icon: FlaskConical },
    { href: '/playbook', label: 'Playbook', icon: BookMarked },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-xs transition group-hover:bg-slate-800">
              <Compass className="h-5 w-5" />
            </div>
            <div className="leading-tight whitespace-nowrap">
              <div className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                The AI Odin Project
              </div>
              <div className="hidden text-[11px] font-medium text-slate-500 xl:block">
                Open AI Product Management Curriculum
              </div>
            </div>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              {/* Name comes from the visible text; it stays readable by screen readers on mobile. */}
              <span className="sr-only sm:not-sr-only">Search</span>
              <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200 lg:inline">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:flex"
              title="View your learning progress"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                {completedCount}/{totalCount} ({pct}%)
              </span>
            </Link>

            {hydrated && user ? (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="hidden items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 sm:inline-flex"
                title={`Signed in as ${user.email ?? user.name}`}
                aria-label={`Account: ${user.name}, ${syncStatus}`}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-amber-400">
                  {user.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                      syncStatus === 'syncing'
                        ? 'animate-pulse bg-indigo-500'
                        : syncStatus === 'offline'
                        ? 'bg-amber-500'
                        : syncStatus === 'error'
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </span>
                <span className="max-w-[96px] truncate">{user.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                {user ? (
                  <>
                    <Cloud className="h-4 w-4 text-emerald-400" /> Account: {user.name}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In to Save Progress
                  </>
                )}
              </button>
              <Link
                href="/paths/foundations"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg bg-amber-700 px-3 py-2 text-center text-sm font-semibold text-white"
              >
                Start Foundations Path
              </Link>
            </div>
          </div>
        )}
      </header>

      {searchOpen && <SearchModal open onClose={() => setSearchOpen(false)} />}
      {authOpen && <AuthModal open onClose={() => setAuthOpen(false)} />}
    </>
  );
}
