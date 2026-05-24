'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import { useAddClosetItem } from '@/hooks/useClosetQueries';
import { CATEGORIES } from '@/lib/constants';
import Image from 'next/image';

export default function UploadModal() {
  const addMutation = useAddClosetItem();

  const { 
    isUploading, 
    uploadImage, 
    uploadCategory, 
    setIsUploading, 
    setUploadImage, 
    setUploadCategory
  } = useClosetStore();

  const handleSave = async () => {
    if (!uploadImage) return;
    await addMutation.mutateAsync({ image: uploadImage, category: uploadCategory });
    setUploadImage(null);
    setIsUploading(false);
  };

  return (
    <AnimatePresence>
      {isUploading && uploadImage && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-[#CCFF00] text-black flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto"
        >
          <button 
            onClick={() => {
              setIsUploading(false);
              setUploadImage(null);
            }}
            className="absolute top-8 right-8 p-4 hover:bg-black hover:text-[#CCFF00] transition-colors border border-black rounded-full"
          >
            <X size={24} />
          </button>

          <h2 className="font-display text-6xl md:text-9xl uppercase tracking-tighter mb-8 md:mb-12 text-center leading-none">
            TAG<br/>ASSET
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center max-w-5xl w-full">
            <div className="w-full md:w-1/2 aspect-[3/4] bg-black border-2 border-black overflow-hidden relative">
              <Image src={uploadImage} alt="Upload preview" fill className="object-cover grayscale" />
              <div className="absolute inset-0 bg-[#CCFF00]/10 mix-blend-overlay"></div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <label className="font-mono text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 block mb-6">
                  Select Classification
                </label>
                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setUploadCategory(cat)}
                      className={`px-6 py-3 font-mono text-sm uppercase tracking-widest transition-all border-2 border-black ${
                        uploadCategory === cat 
                          ? 'bg-black text-[#CCFF00]' 
                          : 'bg-transparent text-black hover:bg-black/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={addMutation.isPending}
                className="w-full bg-black text-[#CCFF00] py-6 font-display text-4xl uppercase tracking-tighter hover:bg-white hover:text-black transition-colors border-2 border-black flex items-center justify-center gap-4 disabled:opacity-50"
              >
                <Upload size={32} />
                {addMutation.isPending ? 'PROCESSING...' : 'INITIALIZE'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
