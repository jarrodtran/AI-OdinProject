import type { MetadataRoute } from 'next';
import { LEARNING_PATHS, LESSONS } from '@/data/catalog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/paths', '/labs', '/playbook'].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
  const paths = LEARNING_PATHS.map((p) => ({
    url: `${SITE_URL}/paths/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const lessons = LESSONS.map((l) => ({
    url: `${SITE_URL}/lessons/${l.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  return [...pages, ...paths, ...lessons];
}
