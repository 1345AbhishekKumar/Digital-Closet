'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Trash2, Share2 } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import { generateOutfitImage, compressImage } from '@/lib/image-utils';
import { generateTryOnImageApi } from '@/lib/gemini';
import { Outfit } from '@/lib/db';
import Image from 'next/image';

export default function SavedTab() {
  const {
    outfits,
    modelImage,
    setModelImage,
    deleteSavedOutfit,
    setCurrentTryOnOutfitId,
    setIsTryOnModalOpen,
    setIsTryingOn,
    setTryOnResultImage,
    addTryOnResult
  } = useClosetStore();

  const modelFileInputRef = useRef<HTMLInputElement>(null);

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        const compressed = await compressImage(result, 1024);
        setModelImage(compressed);
      }
    };
    reader.readAsDataURL(file);
    
    if (modelFileInputRef.current) {
      modelFileInputRef.current.value = '';
    }
  };

  const handleShareOutfit = async (outfit: Outfit) => {
    try {
      const dataUrl = await generateOutfitImage(outfit);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `outfit-${outfit.id.split('-')[0]}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Wardrobe OS Outfit',
          text: 'Check out this outfit I generated with Wardrobe OS!',
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `outfit-${outfit.id.split('-')[0]}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Error sharing outfit:", error);
      alert("Failed to share outfit.");
    }
  };

  const handleTryOn = async (outfit: Outfit) => {
    if (!modelImage) {
      modelFileInputRef.current?.click();
      return;
    }

    setCurrentTryOnOutfitId(outfit.id);
    setIsTryOnModalOpen(true);
    setIsTryingOn(true);
    setTryOnResultImage(null);

    try {
      const imageUrl = await generateTryOnImageApi(modelImage, outfit);
      setTryOnResultImage(imageUrl);
      await addTryOnResult(imageUrl, outfit.id);
    } catch (error) {
      console.error("Error generating try-on image:", error);
      alert("Failed to generate try-on image. Please try again.");
      setIsTryOnModalOpen(false);
    } finally {
      setIsTryingOn(false);
    }
  };

  return (
    <motion.div
      key="saved"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <h2 className="font-display text-7xl md:text-9xl leading-[0.8] tracking-tighter">ARCHIVE</h2>
        <div className="flex items-center gap-4">
          {modelImage && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#CCFF00] relative">
              <Image src={modelImage} alt="Model Avatar" fill className="object-cover" />
            </div>
          )}
          <button 
            onClick={() => modelFileInputRef.current?.click()}
            className="group flex items-center justify-center gap-4 bg-transparent border border-white/30 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            <span>{modelImage ? 'Change Avatar' : 'Set Model Avatar'}</span>
          </button>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={modelFileInputRef}
            onChange={handleModelFileChange}
          />
        </div>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-32 border border-white/10 bg-white/5">
          <h3 className="font-display text-4xl text-white/50">ARCHIVE EMPTY</h3>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-8 pb-12 snap-x scrollbar-hide items-center min-h-[50vh]">
          {outfits.map((outfit, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={outfit.id} 
              className="snap-center shrink-0 w-[85vw] md:w-[450px] border border-white/20 bg-black p-6 relative group"
            >
              <button 
                onClick={() => deleteSavedOutfit(outfit.id)}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex flex-wrap justify-center items-center -space-x-4 mb-6">
                {outfit.items.map((item, j) => (
                  <div key={item.id} className="w-32 h-40 border border-white/20 bg-black shadow-xl relative" style={{ transform: `rotate(${j % 2 === 0 ? 4 : -4}deg)` }}>
                    <Image src={item.imageUrl} alt={item.category} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-4 flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/50">
                <span>ID: {outfit.id.split('-')[0]}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShareOutfit(outfit)}
                    className="bg-white/10 text-white px-4 py-2 hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                  >
                    <Share2 size={14} />
                    SHARE
                  </button>
                  <button 
                    onClick={() => handleTryOn(outfit)}
                    className="bg-[#CCFF00] text-black px-4 py-2 hover:bg-white transition-colors"
                  >
                    VIRTUAL TRY-ON
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
