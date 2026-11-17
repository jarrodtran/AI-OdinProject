import type { Metadata } from 'next';
import DashboardView from './DashboardView';

export const metadata: Metadata = {
  title: 'Your Dashboard',
  description:
    'Track your AI product management learning progress, projects and quiz scores.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <DashboardView />;
}
