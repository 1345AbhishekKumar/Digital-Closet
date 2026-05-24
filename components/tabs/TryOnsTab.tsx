'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Save } from 'lucide-react';
import { useTryOnImages, useDeleteTryOnImage } from '@/hooks/useClosetQueries';
import Image from 'next/image';

export default function TryOnsTab() {
  const { data: tryOnImages = [] } = useTryOnImages();
  const deleteMutation = useDeleteTryOnImage();

  return (
    <motion.div
      key="tryons"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <h2 className="font-display text-7xl md:text-9xl leading-[0.8] tracking-tighter">LOOKBOOK</h2>
      </div>

      {tryOnImages.length === 0 ? (
        <div className="text-center py-32 border border-white/10 bg-white/5">
          <h3 className="font-display text-4xl text-white/50">NO FITTINGS YET</h3>
          <p className="font-mono text-sm text-white/30 mt-4 uppercase tracking-widest">Generate virtual try-ons from the Archive tab</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {tryOnImages.map((tryOn, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={tryOn.id} 
              className="group relative break-inside-avoid border-4 border-white/10 bg-black overflow-hidden hover:border-[#CCFF00] transition-colors duration-300"
            >
              <Image src={tryOn.imageUrl} alt="Virtual Try-On" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} className="w-full h-auto object-cover" />
              
              <div className="absolute top-4 left-4 bg-black/80 text-[#CCFF00] text-[10px] font-mono px-3 py-2 uppercase border border-white/10 backdrop-blur-md">
                FIT ID: {tryOn.id.split('-')[0]}
              </div>

              <button 
                onClick={() => deleteMutation.mutate(tryOn.id)}
                className="absolute top-4 right-4 bg-red-500 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
                  {new Date(tryOn.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = tryOn.imageUrl;
                    link.download = `lookbook-${tryOn.id.split('-')[0]}.jpg`;
                    link.click();
                  }}
                  className="bg-white text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-[#CCFF00] transition-colors flex items-center gap-2"
                >
                  <Save size={14} />
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
