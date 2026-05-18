'use client';

import { ClothingItem, Outfit } from './db';

export const compressImage = (dataUrl: string, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
};

export const generateOutfitImage = async (outfit: Outfit): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const itemWidth = 400;
  const itemHeight = 500;
  const padding = 40;
  
  canvas.width = (itemWidth * outfit.items.length) + (padding * (outfit.items.length + 1));
  canvas.height = itemHeight + (padding * 2) + 100;

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#CCFF00';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`WARDROBE OS // OUTFIT ${outfit.id.split('-')[0].toUpperCase()}`, canvas.width / 2, 60);

  const loadAndDrawImage = (item: ClothingItem, index: number) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const x = padding + (index * (itemWidth + padding));
        const y = padding + 80;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, itemWidth, itemHeight);
        
        const scale = Math.max(itemWidth / img.width, itemHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = x + (itemWidth - drawWidth) / 2;
        const offsetY = y + (itemHeight - drawHeight) / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, itemWidth, itemHeight);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x + 10, y + 10, 120, 40);
        ctx.fillStyle = '#CCFF00';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(item.category.toUpperCase(), x + 20, y + 38);

        resolve();
      };
      img.src = item.imageUrl;
    });
  };

  await Promise.all(outfit.items.map((item, index) => loadAndDrawImage(item, index)));

  return canvas.toDataURL('image/jpeg', 0.9);
};
