import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LEARNING_PATHS, getPathBySlug } from '@/data/catalog';
import { PathDetail } from './PathDetail';

type Params = { params: Promise<{ pathSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LEARNING_PATHS.map((path) => ({ pathSlug: path.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { pathSlug } = await params;
  const path = getPathBySlug(pathSlug);
  if (!path) return {};
  const url = `/paths/${path.slug}`;
  return {
    title: path.title,
    description: path.tagline,
    alternates: { canonical: url },
    openGraph: { title: path.title, description: path.tagline, url },
  };
}

export default async function PathPage({ params }: Params) {
  const { pathSlug } = await params;
  const path = getPathBySlug(pathSlug);
  if (!path) notFound();
  return <PathDetail key={path.slug} path={path} />;
}
