'use client';

import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useClosetStore } from '@/store/useClosetStore';
import { compressImage } from '@/lib/image-utils';

// Tabs
import ClosetTab from './tabs/ClosetTab';
import GeneratorTab from './tabs/GeneratorTab';
import SavedTab from './tabs/SavedTab';
import TryOnsTab from './tabs/TryOnsTab';

// Modals
import UploadModal from './modals/UploadModal';
import GenerateItemModal from './modals/GenerateItemModal';
import TryOnModal from './modals/TryOnModal';

export default function ClosetApp() {
  const { 
    activeTab, 
    setActiveTab, 
    loadData, 
    setUploadImage, 
    setIsUploading 
  } = useClosetStore();

  useEffect(() => {
    loadData();

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const result = event.target?.result as string;
              if (result) {
                const compressed = await compressImage(result);
                setUploadImage(compressed);
                setIsUploading(true);
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [loadData, setUploadImage, setIsUploading]);

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden">
      {/* Marquee Header */}
      <div className="fixed top-0 left-0 w-full overflow-hidden whitespace-nowrap py-3 border-b border-white/10 z-30 bg-black/50 backdrop-blur-md">
        <div className="flex animate-[marquee_20s_linear_infinite] font-display text-3xl md:text-5xl uppercase tracking-tighter text-white/30">
          <span>WARDROBE OS // V1.0 // DIGITAL STYLIST // WARDROBE OS // V1.0 // DIGITAL STYLIST // WARDROBE OS // V1.0 // DIGITAL STYLIST // </span>
        </div>
      </div>

      {/* Floating Nav */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex gap-2 shadow-2xl">
        {(['closet', 'generator', 'saved', 'tryons'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-[#CCFF00] text-black font-bold' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'closet' && <ClosetTab />}
          {activeTab === 'generator' && <GeneratorTab />}
          {activeTab === 'saved' && <SavedTab />}
          {activeTab === 'tryons' && <TryOnsTab />}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <UploadModal />
      <GenerateItemModal />
      <TryOnModal />
    </div>
  );
}
