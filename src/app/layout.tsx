import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { authEnabled } from '@/lib/authEnv';

const description =
  'Master AI Product Management by shipping real AI-native PRDs, golden eval harnesses, RAG architectures, token unit economics, and agent reliability specs.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Free, Open-Source AI Product Management Curriculum`,
    template: `%s · ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Free AI Product Management Curriculum`,
    description,
    url: '/',
  },
  twitter: { card: 'summary', title: SITE_NAME, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers cloudEnabled={authEnabled}>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
