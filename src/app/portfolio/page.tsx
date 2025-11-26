// app/portfolio/page.tsx
import { Suspense } from 'react';
import PortfolioViewer from '@/components/PortfolioViewer';
import { getPortfolioItems } from '@/lib/notion/portfolio';

export const revalidate = 3600; // Revalidate every hour

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