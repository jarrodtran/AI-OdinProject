import type { Metadata } from 'next';
import LabsView from './LabsView';

export const metadata: Metadata = {
  title: 'Interactive AI PM Labs',
  description:
    'Ten browser simulators for token economics, prompt specs, evals, RAG debugging, agent reliability, model routing, pricing and incident response.',
  alternates: { canonical: '/labs' },
};

export default function Page() {
  return <LabsView />;
}
