/** Canonical site origin, used for metadata, sitemap and robots. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://ai-odin-project.vercel.app')
).replace(/\/$/, '');

export const SITE_NAME = 'The AI Odin Project';
