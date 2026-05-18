import { Category } from './db';

export const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

export const STYLES = [
  { id: 'ANY', desc: 'Let the AI decide the best look' },
  { id: 'MINIMALIST', desc: 'Clean lines, neutral colors, simple silhouettes' },
  { id: 'STREETWEAR', desc: 'Casual, comfortable clothing with an urban edge' },
  { id: 'AVANT-GARDE', desc: 'Experimental, innovative, and unconventional designs' },
  { id: 'CASUAL', desc: 'Relaxed, everyday wear for comfort' },
  { id: 'FORMAL', desc: 'Elegant, dressy attire for special occasions' },
  { id: 'Y2K', desc: 'Late 90s and early 2000s inspired fashion' },
  { id: 'GOTHIC', desc: 'Dark, mysterious, and dramatic aesthetics' }
];

export const COLORS = [
  { id: 'ANY', hex: 'transparent', label: 'ANY' },
  { id: 'BLACK', hex: '#000000', label: 'Black' },
  { id: 'WHITE', hex: '#FFFFFF', label: 'White' },
  { id: 'GRAY', hex: '#808080', label: 'Gray' },
  { id: 'RED', hex: '#FF0000', label: 'Red' },
  { id: 'BLUE', hex: '#0000FF', label: 'Blue' },
  { id: 'GREEN', hex: '#00FF00', label: 'Green' },
  { id: 'EARTH', hex: '#8B4513', label: 'Earth' },
  { id: 'NEON', hex: '#CCFF00', label: 'Neon' }
];
