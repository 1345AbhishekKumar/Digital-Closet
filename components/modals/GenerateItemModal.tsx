'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import { generateSingleItemImageApi } from '@/lib/gemini';

export default function GenerateItemModal() {
  const { 
    isGenerateModalOpen, 
    generatePrompt, 
    isGeneratingItem, 
    setIsGenerateModalOpen, 
    setGeneratePrompt, 
    setIsGeneratingItem,
    setUploadImage,
    setIsUploading
  } = useClosetStore();

  const handleGenerateItem = async () => {
    if (!generatePrompt.trim()) return;
    setIsGeneratingItem(true);
    try {
      const imageUrl = await generateSingleItemImageApi(generatePrompt);
      setUploadImage(imageUrl);
      setIsGenerateModalOpen(false);
      setGeneratePrompt('');
      setIsUploading(true);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingItem(false);
    }
  };

  return (
    <AnimatePresence>
      {isGenerateModalOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-white text-black flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto"
        >
          <button 
            onClick={() => {
              setIsGenerateModalOpen(false);
              setGeneratePrompt('');
            }}
            className="absolute top-8 right-8 p-4 hover:bg-black hover:text-white transition-colors border border-black rounded-full"
          >
            <X size={24} />
          </button>

          <h2 className="font-display text-6xl md:text-9xl uppercase tracking-tighter mb-8 md:mb-12 text-center leading-none">
            SYNTHESIZE<br/>ASSET
          </h2>
          
          <div className="flex flex-col gap-8 items-center max-w-3xl w-full">
            <div className="w-full space-y-8">
              <div>
                <label className="font-mono text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 block mb-6">
                  Describe the Item
                </label>
                <textarea
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  placeholder="e.g., A futuristic silver puffer jacket with neon accents..."
                  className="w-full bg-transparent border-2 border-black p-4 font-mono text-lg outline-none focus:bg-black/5 min-h-[150px] resize-none"
                />
              </div>

              <button 
                onClick={handleGenerateItem}
                disabled={isGeneratingItem || !generatePrompt.trim()}
                className="w-full bg-black text-white py-6 font-display text-4xl uppercase tracking-tighter hover:bg-[#CCFF00] hover:text-black transition-colors border-2 border-black flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
              >
                {isGeneratingItem ? 'SYNTHESIZING...' : 'GENERATE'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
