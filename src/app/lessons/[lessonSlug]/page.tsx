import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LESSONS, getLessonBySlug } from '@/data/curriculum';
import { LessonReader } from './LessonReader';

type Params = { params: Promise<{ lessonSlug: string }> };

// Every lesson is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ lessonSlug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) return {};
  const url = `/lessons/${lesson.slug}`;
  return {
    title: lesson.title,
    description: lesson.summary,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: lesson.title, description: lesson.summary, url },
  };
}

export default async function LessonPage({ params }: Params) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) notFound();
  // key resets all per-lesson UI state when navigating between lessons.
  return <LessonReader key={lesson.slug} lesson={lesson} />;
}
