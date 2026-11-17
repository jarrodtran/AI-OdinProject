import type { Metadata } from 'next';
import AllPathsView from './AllPathsView';

export const metadata: Metadata = {
  title: 'Learning Paths',
  description:
    'Three structured AI product management paths, from LLM foundations to AI strategy and technical AI PM, with projects and quizzes.',
  alternates: { canonical: '/paths' },
};

export default function Page() {
  return <AllPathsView />;
}
