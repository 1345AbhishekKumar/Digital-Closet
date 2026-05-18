'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import Image from 'next/image';

export default function TryOnModal() {
  const { 
    isTryOnModalOpen, 
    tryOnResultImage, 
    isTryingOn, 
    setIsTryOnModalOpen, 
    setTryOnResultImage 
  } = useClosetStore();

  return (
    <AnimatePresence>
      {isTryOnModalOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto"
        >
          <button 
            onClick={() => {
              setIsTryOnModalOpen(false);
              setTryOnResultImage(null);
            }}
            className="absolute top-8 right-8 p-4 hover:bg-white hover:text-black transition-colors border border-white rounded-full"
          >
            <X size={24} />
          </button>

          <h2 className="font-display text-6xl md:text-9xl uppercase tracking-tighter mb-8 md:mb-12 text-center leading-none text-[#CCFF00]">
            VIRTUAL<br/>FITTING
          </h2>
          
          <div className="flex flex-col items-center max-w-3xl w-full">
            {isTryingOn ? (
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="w-32 h-32 border-4 border-[#CCFF00] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-mono text-xl uppercase tracking-widest text-[#CCFF00] animate-pulse">Synthesizing Fit...</p>
              </div>
            ) : tryOnResultImage ? (
              <div className="flex flex-col items-center space-y-8">
                <div className="w-full max-w-md border-4 border-[#CCFF00] p-2 bg-white/5 relative">
                  <Image src={tryOnResultImage} alt="Try-On Result" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} className="object-cover" />
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = tryOnResultImage;
                    link.download = 'virtual-try-on.jpg';
                    link.click();
                  }}
                  className="bg-[#CCFF00] text-black px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Download Image
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
