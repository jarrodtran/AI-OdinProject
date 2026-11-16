import type { Metadata } from 'next';
import './globals.css';
import { ProgressProvider } from '@/context/ProgressContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'The AI Odin Project · Free, Open-Source AI Product Management Curriculum',
  description:
    'Master AI Product Management by shipping real AI-native PRDs, golden eval harnesses, RAG architectures, token unit economics, and agent reliability specs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
        <ProgressProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ProgressProvider>
      </body>
    </html>
  );
}
