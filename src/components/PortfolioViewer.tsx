// components/PortfolioViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { PortfolioScene } from '@/lib/PortfolioScene';
import type { NotionPortfolioItem, ViewMode } from '@/types/portfolio';

interface PortfolioViewerProps {
  items: NotionPortfolioItem[];
  initialMode?: ViewMode;
}

export default function PortfolioViewer({ 
  items, 
  initialMode = 'grid' 
}: PortfolioViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PortfolioScene | null>(null);
  const [currentMode, setCurrentMode] = useState<ViewMode>(initialMode);
  const [selectedItem, setSelectedItem] = useState<NotionPortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Available layout modes
  const layoutModes: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'grid', label: 'Grid', icon: '▦' },
    { mode: 'spiral', label: 'Spiral', icon: '🌀' },
    { mode: 'sphere', label: 'Sphere', icon: '⚪' },
    { mode: 'wave', label: 'Wave', icon: '〰️' },
    { mode: 'constellation', label: 'Constellation', icon: '✨' },
    { mode: 'carousel', label: 'Carousel', icon: '🎠' },
    { mode: 'timeline', label: 'Timeline', icon: '📅' }
  ];
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    console.log('🎨 Initializing 3D scene with', items.length, 'items');
    
    try {
      // Initialize scene
      const scene = new PortfolioScene(canvasRef.current);
      sceneRef.current = scene;
      
      // Load portfolio items
      scene.loadPortfolio(items).then(() => {
        console.log('✅ Portfolio loaded successfully');
        setIsLoading(false);
      }).catch(error => {
        console.error('❌ Error loading portfolio:', error);
        setIsLoading(false);
      });
      
      // Animation loop
      let animationFrameId: number;
      const animate = () => {
        scene.update();
        scene.render();
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
      
      // Listen for window clicks
      const handleWindowClick = (e: Event) => {
        const customEvent = e as CustomEvent;
        setSelectedItem(customEvent.detail.notionData);
      };
      window.addEventListener('contentWindowClick', handleWindowClick);
      
      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        scene.dispose();
        window.removeEventListener('contentWindowClick', handleWindowClick);
      };
    } catch (error) {
      console.error('❌ Error initializing scene:', error);
      // Defer the state update so the effect remains focused on synchronizing
      // the Three.js scene and does not trigger a cascading render.
      queueMicrotask(() => setIsLoading(false));
    }
  }, [items]);
  
  const handleLayoutChange = async (mode: ViewMode) => {
    if (!sceneRef.current || currentMode === mode) return;
    
    await sceneRef.current.transitionToLayout(mode);
    setCurrentMode(mode);
  };
  
  const closeDetailView = () => {
    setSelectedItem(null);
  };
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
          <div className="text-white text-2xl font-light animate-pulse">
            Loading Portfolio...
          </div>
        </div>
      )}
      
      {/* Layout mode switcher */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-black bg-opacity-60 backdrop-blur-md rounded-full p-2 border border-white border-opacity-20">
          {layoutModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => handleLayoutChange(mode)}
              className={`
                px-4 py-2 rounded-full transition-all duration-300
                ${currentMode === mode 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                  : 'bg-transparent text-white hover:bg-white hover:bg-opacity-10'
                }
              `}
              title={label}
            >
              <span className="mr-2">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-8 left-8 z-20 text-white">
        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
          <h2 className="text-xl font-bold mb-2">Portfolio</h2>
          <p className="text-sm text-gray-300">
            {items.length} projects • {currentMode} view
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Drag to rotate • Scroll to zoom • Click items for details
          </p>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
          <div className="text-xs text-gray-300 space-y-1">
            <div>🖱️ Left drag: Rotate view</div>
            <div>🔍 Scroll: Zoom</div>
            <div>👆 Click: Select item</div>
          </div>
        </div>
      </div>
      
      {/* Detail modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
          onClick={closeDetailView}
        >
          <div 
            className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeDetailView}
              className="absolute top-4 right-4 text-white hover:text-blue-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Content */}
            <div className="text-white">
              {selectedItem.coverImage && (
                // Portfolio media URLs come from Notion and are not guaranteed
                // to use a host configured for Next Image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={selectedItem.coverImage} 
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-4xl font-bold mb-4">{selectedItem.title}</h1>
              
              {selectedItem.category && (
                <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mb-4">
                  {selectedItem.category}
                </div>
              )}
              
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedItem.tags.map(tag => (
                    <span 
                      key={tag}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {selectedItem.excerpt && (
                <p className="text-gray-300 text-lg mb-6">{selectedItem.excerpt}</p>
              )}
              
              <div className="text-sm text-gray-400 mb-6">
                Published: {new Date(selectedItem.publishedAt).toLocaleDateString()}
              </div>
              
              {/* Link to full page */}
              <a
                href={`/portfolio/${selectedItem.slug}`}
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                View Full Project →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
