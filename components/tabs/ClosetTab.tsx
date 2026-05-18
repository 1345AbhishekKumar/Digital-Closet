'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useClosetStore } from '@/store/useClosetStore';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function ClosetTab() {
  const { 
    items, 
    isSelectionMode, 
    selectedItemIds, 
    setIsSelectionMode, 
    toggleSelection, 
    deleteSelectedItems, 
    deleteItem,
    clearSelection,
    setUploadImage,
    setIsUploading,
    setIsGenerateModalOpen
  } = useClosetStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        const compressed = await compressImage(result);
        setUploadImage(compressed);
        setIsUploading(true);
      }
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      key="closet"
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <h2 className="font-display text-7xl md:text-9xl leading-[0.8] tracking-tighter">INDEX</h2>
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {isSelectionMode && selectedItemIds.size > 0 && (
            <button 
              onClick={deleteSelectedItems}
              className="group flex items-center justify-center gap-4 bg-red-500 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} />
              <span>Delete ({selectedItemIds.size})</span>
            </button>
          )}
          {items.length > 0 && (
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                clearSelection();
              }}
              className={`group flex items-center justify-center gap-4 border border-white/30 px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-colors ${isSelectionMode ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
            </button>
          )}
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="group flex items-center justify-center gap-4 bg-transparent border border-white/30 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            <span>Generate Item</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center justify-center gap-4 bg-white text-black px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest hover:bg-[#CCFF00] transition-colors"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Add Item (or Paste)</span>
          </button>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32 border border-white/10 bg-white/5">
          <h3 className="font-display text-4xl mb-4 text-white/50">NO DATA FOUND</h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="font-mono text-sm text-[#CCFF00] underline underline-offset-8 hover:text-white transition-colors uppercase tracking-widest"
          >
            Initialize Database (or Paste Image)
          </button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item.id} 
              onClick={() => isSelectionMode && toggleSelection(item.id)}
              className={`group relative break-inside-avoid border bg-black overflow-hidden hover:z-10 transition-all duration-300 ${
                isSelectionMode ? 'cursor-pointer' : 'hover:scale-[1.02]'
              } ${
                selectedItemIds.has(item.id) ? 'border-[#CCFF00] border-4' : 'border-white/20'
              }`}
            >
              <Image
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
                src={item.imageUrl} 
                alt={item.category} 
                className={`w-full h-auto object-cover transition-all duration-500 ${
                  isSelectionMode 
                    ? (selectedItemIds.has(item.id) ? 'grayscale-0 opacity-100' : 'grayscale opacity-40') 
                    : 'grayscale group-hover:grayscale-0'
                }`} 
              />
              
              <div className="absolute top-2 left-2 bg-black/80 text-[#CCFF00] text-[10px] font-mono px-2 py-1 uppercase border border-white/10">
                {item.category}
              </div>

              {isSelectionMode ? (
                <div className={`absolute top-2 right-2 p-1 border rounded-full transition-colors ${selectedItemIds.has(item.id) ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-black/50 border-white/50 text-transparent'}`}>
                  <Check size={16} />
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
