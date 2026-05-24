'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Shuffle, Save, Lock, Unlock } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import { useClosetItems, useStylePreference, useUpdateStylePreference, useSaveOutfit } from '@/hooks/useClosetQueries';
import { STYLES, COLORS } from '@/lib/constants';
import { generateOutfitRecommendation } from '@/lib/openrouter';
import { ClothingItem, Category } from '@/lib/db';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function GeneratorTab() {
  const { data: items = [] } = useClosetItems();
  const { data: stylePreference = 'ANY' } = useStylePreference();
  const updateStyleMutation = useUpdateStylePreference();
  const saveOutfitMutation = useSaveOutfit();

  const {
    generatedOutfit,
    isGenerating,
    flickerImage,
    lockedItemIds,
    dominantColor,
    setGeneratedOutfit,
    setIsGenerating,
    setFlickerImage,
    toggleLock,
    setDominantColor,
    setActiveTab
  } = useClosetStore();

  const saveCurrentOutfit = async () => {
    if (generatedOutfit.length === 0) return;
    await saveOutfitMutation.mutateAsync(generatedOutfit);
    setActiveTab('saved');
  };

  const setStylePreference = (pref: string) => {
    updateStyleMutation.mutate(pref);
  };

  const generateOutfit = async (mode: 'shuffle' | 'variation' = 'shuffle') => {
    if (items.length < 3) return;
    setIsGenerating(true);
    
    if (generatedOutfit.length === 0 || mode === 'shuffle') {
      setGeneratedOutfit([]);
    }
    
    let ticks = 0;
    const interval = setInterval(() => {
      const unlockedItems = items.filter(item => !lockedItemIds.has(item.id));
      if (unlockedItems.length > 0) {
        const randomItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
        setFlickerImage(randomItem.imageUrl);
      }
      ticks++;
    }, 100);

    try {
      const currentOutfitIds = generatedOutfit.map(i => i.id);

      const MAX_ITEMS = 10;
      let itemsToProcess = [...items];

      if (itemsToProcess.length > MAX_ITEMS) {
        let lockedItems = items.filter(item => lockedItemIds.has(item.id));
        if (lockedItems.length > MAX_ITEMS) {
          lockedItems = lockedItems.slice(0, MAX_ITEMS);
        }

        let remainingUnlocked = items.filter(item => !lockedItemIds.has(item.id));
        const selectedUnlocked: ClothingItem[] = [];
        const requiredCategories: Category[] = ['Tops', 'Bottoms', 'Shoes'];
        
        let availableSlots = MAX_ITEMS - lockedItems.length;

        for (const cat of requiredCategories) {
          if (availableSlots > 0 && !lockedItems.some(i => i.category === cat) && !selectedUnlocked.some(i => i.category === cat)) {
            const catItems = remainingUnlocked.filter(i => i.category === cat);
            if (catItems.length > 0) {
              const randomItem = catItems[Math.floor(Math.random() * catItems.length)];
              selectedUnlocked.push(randomItem);
              remainingUnlocked = remainingUnlocked.filter(i => i.id !== randomItem.id);
              availableSlots--;
            }
          }
        }
        
        remainingUnlocked = remainingUnlocked.sort(() => 0.5 - Math.random());
        if (availableSlots > 0) {
          selectedUnlocked.push(...remainingUnlocked.slice(0, availableSlots));
        }
        
        itemsToProcess = [...lockedItems, ...selectedUnlocked];
      }

      const processedItems = await Promise.all(itemsToProcess.map(async item => {
        try {
          const smallImage = await compressImage(item.imageUrl, 256);
          return { ...item, imageUrl: smallImage };
        } catch (e) {
          console.warn("Failed to compress image for AI:", item.id, e);
          return item;
        }
      }));

      const selectedIds = await generateOutfitRecommendation(
        processedItems,
        Array.from(lockedItemIds),
        stylePreference,
        dominantColor,
        mode,
        currentOutfitIds
      );
      
      let newOutfit = selectedIds
        .map((id: string) => items.find(item => item.id === id))
        .filter((item: any) => item !== undefined) as ClothingItem[];
      
      const fallbackLockedItems = items.filter(item => lockedItemIds.has(item.id));
      fallbackLockedItems.forEach(lockedItem => {
        if (!newOutfit.find(item => item.id === lockedItem.id)) {
          newOutfit.push(lockedItem);
        }
      });

      if (newOutfit.length < 3) {
        const requiredCategories: Category[] = ['Tops', 'Bottoms', 'Shoes'];
        const currentCategories = new Set(newOutfit.map(i => i.category));
        
        requiredCategories.forEach(cat => {
          if (!currentCategories.has(cat)) {
            const catItems = items.filter(item => item.category === cat && !lockedItemIds.has(item.id));
            if (catItems.length > 0) {
              newOutfit.push(catItems[Math.floor(Math.random() * catItems.length)]);
            }
          }
        });
      }

      const minFlickerTime = 1500;
      const elapsedTime = ticks * 100;
      if (elapsedTime < minFlickerTime) {
        await new Promise(resolve => setTimeout(resolve, minFlickerTime - elapsedTime));
      }

      clearInterval(interval);
      setFlickerImage(null);
      setGeneratedOutfit(newOutfit);
      setIsGenerating(false);

    } catch (error) {
      console.error("Error generating outfit with AI:", error);
      clearInterval(interval);
      setFlickerImage(null);
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      key="generator"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="min-h-[70vh] flex flex-col items-center justify-center relative"
    >
      {items.length < 3 ? (
        <div className="text-center">
          <h2 className="font-display text-5xl md:text-7xl text-white/30 mb-6">INSUFFICIENT DATA</h2>
          <p className="font-mono text-sm text-white/50 uppercase tracking-widest">Requires Top + Bottom + Shoes</p>
        </div>
      ) : (
        <>
          {isGenerating && generatedOutfit.length === 0 && flickerImage && (
            <div className="absolute inset-0 flex items-center justify-center z-20 mix-blend-screen">
              <Image src={flickerImage} width={384} height={384} className="w-64 h-64 md:w-96 md:h-96 object-cover grayscale contrast-150" alt="Flicker" />
              <div className="absolute inset-0 bg-[#CCFF00]/20"></div>
            </div>
          )}

          {(generatedOutfit.length > 0 || (isGenerating && generatedOutfit.length > 0)) && (
            <div className="flex flex-wrap justify-center items-center -space-x-8 md:-space-x-16 mb-16 relative z-10 w-full max-w-4xl">
              {generatedOutfit.map((item, i) => {
                const isLocked = lockedItemIds.has(item.id);
                const isFlickering = isGenerating && !isLocked;
                return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 100, rotate: -15 }}
                  animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? 6 : -6 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  className="w-40 h-56 md:w-64 md:h-80 border border-white/20 bg-black shadow-2xl hover:z-50 transition-all duration-300 hover:scale-105 group relative"
                  style={{ zIndex: 10 + i }}
                >
                  <Image 
                    src={isFlickering && flickerImage ? flickerImage : item.imageUrl}
                    fill
                    className={`object-cover transition-all duration-500 ${isFlickering ? 'grayscale contrast-150 mix-blend-screen' : 'grayscale group-hover:grayscale-0'}`} 
                    alt={item.category} 
                  />
                  
                  <button
                    onClick={() => toggleLock(item.id)}
                    disabled={isGenerating}
                    className={`absolute top-2 right-2 p-2 bg-black/80 border border-white/10 transition-all ${isLocked ? 'text-[#CCFF00] opacity-100' : 'text-white/50 opacity-0 group-hover:opacity-100 hover:text-white'} disabled:opacity-0`}
                  >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>

                  <div className="absolute bottom-2 left-2 bg-black/80 text-[#CCFF00] text-[10px] font-mono px-2 py-1 uppercase">
                    {item.category}
                  </div>
                </motion.div>
              )})}
            </div>
          )}

          <div className="flex flex-col items-center gap-6 z-30 mt-8">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {STYLES.map(style => (
                <div key={style.id} className="relative group">
                  <button
                    onClick={() => setStylePreference(style.id)}
                    disabled={isGenerating}
                    className={`font-mono text-xs px-3 py-1 border transition-colors disabled:opacity-50 ${stylePreference === style.id ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-transparent text-white/50 border-white/20 hover:text-white hover:border-white/50'}`}
                  >
                    {style.id}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-black border border-white/20 text-white/70 text-[10px] font-mono p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                    {style.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {COLORS.map(color => (
                <div key={color.id} className="relative group">
                  <button
                    onClick={() => setDominantColor(color.id)}
                    disabled={isGenerating}
                    className={`font-mono text-xs px-3 py-1 border transition-colors disabled:opacity-50 flex items-center gap-2 ${dominantColor === color.id ? 'bg-white text-black border-white' : 'bg-transparent text-white/50 border-white/20 hover:text-white hover:border-white/50'}`}
                  >
                    {color.id !== 'ANY' && (
                      <span 
                        className="w-3 h-3 rounded-full border border-black/20" 
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {color.label}
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => generateOutfit('shuffle')}
              disabled={isGenerating}
              className="font-display text-7xl md:text-9xl uppercase tracking-tighter hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:hover:text-white"
            >
              {isGenerating ? 'PROCESSING' : generatedOutfit.length > 0 ? 'RESHUFFLE' : 'SHUFFLE'}
            </button>
            
            {generatedOutfit.length > 0 && !isGenerating && (
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => generateOutfit('variation')}
                  className="font-mono text-sm uppercase tracking-widest border border-white/30 text-white/80 px-8 py-4 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors flex items-center justify-center gap-2"
                >
                  <Shuffle size={16} />
                  Generate Variation
                </button>
                <button 
                  onClick={saveCurrentOutfit}
                  disabled={saveOutfitMutation.isPending}
                  className="font-mono text-sm uppercase tracking-widest bg-[#CCFF00] text-black px-8 py-4 hover:bg-transparent hover:text-[#CCFF00] border border-transparent hover:border-[#CCFF00] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saveOutfitMutation.isPending ? 'SAVING...' : 'Save Configuration'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
