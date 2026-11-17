import type { Metadata } from 'next';
import PlaybookView from './PlaybookView';

export const metadata: Metadata = {
  title: 'AI PM Playbook',
  description:
    'Templates, decision matrices, AI-native product teardowns, interview blueprints and a technical glossary for AI product managers.',
  alternates: { canonical: '/playbook' },
};

export default function Page() {
  return <PlaybookView />;
}
