'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, FlaskConical, LayoutDashboard, BookMarked } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">The AI Odin Project</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              An open, project-driven curriculum empowering Product Managers to master LLM
              mechanics, unit economics, Evals-Driven Development, RAG pipelines, and reliable
              agentic systems—free forever, modeled after The Odin Project ethos.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase">
              Curriculum Paths
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/paths/foundations" className="hover:text-amber-700">
                  Foundations of AI PM
                </Link>
              </li>
              <li>
                <Link href="/paths/ai-product-strategy" className="hover:text-amber-700">
                  AI Strategy & Growth
                </Link>
              </li>
              <li>
                <Link href="/paths/technical-ai-pm" className="hover:text-amber-700">
                  Technical AI PM: Evals, RAG & Agents
                </Link>
              </li>
              <li>
                <Link href="/paths" className="hover:text-amber-700">
                  Compare All Paths
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase">
              Hands-On Practice
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/labs" className="flex items-center gap-1.5 hover:text-amber-700">
                  <FlaskConical className="h-3.5 w-3.5" /> Interactive AI PM Labs
                </Link>
              </li>
              <li>
                <Link href="/playbook" className="flex items-center gap-1.5 hover:text-amber-700">
                  <BookMarked className="h-3.5 w-3.5" /> Field Manual &amp; Playbook
                </Link>
              </li>
              <li>
                <Link
                  href="/playbook#interviews"
                  className="flex items-center gap-1.5 hover:text-amber-700"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Staff Interview Prep Bank
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-amber-700">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Progress & Portfolio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            Built for aspiring and practicing AI Product Managers. Progress saves locally in your
            browser with JSON export.
          </p>
          <p className="font-medium text-slate-600">Learn by shipping real AI specs, evals & architectures.</p>
        </div>
      </div>
    </footer>
  );
}
