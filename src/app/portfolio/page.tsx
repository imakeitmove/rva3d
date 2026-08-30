// app/portfolio/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import PortfolioViewer from '@/components/PortfolioViewer';
import { getPortfolioItems } from '@/lib/notion/portfolio';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Experimental Portfolio Archive | RVA3D',
  description: 'An experimental legacy portfolio view maintained by RVA3D.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolioItems();

  return (
    <main className="w-full h-screen">
      <Suspense fallback={<PortfolioLoadingState />}>
        <PortfolioViewer items={portfolioItems} initialMode="grid" />
      </Suspense>
    </main>
  );
}

function PortfolioLoadingState() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-2xl font-light animate-pulse">
        Loading Portfolio...
      </div>
    </div>
  );
}
