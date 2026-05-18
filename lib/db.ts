import { get, set, update } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories';

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: Category;
  createdAt: number;
}

export interface Outfit {
  id: string;
  items: ClothingItem[];
  createdAt: number;
}

export interface TryOnImage {
  id: string;
  imageUrl: string;
  outfitId: string;
  createdAt: number;
}

const CLOSET_KEY = 'digital_closet_items';
const OUTFITS_KEY = 'digital_closet_outfits';
const STYLE_PREF_KEY = 'digital_closet_style_pref';
const TRYON_KEY = 'digital_closet_tryons';

export async function getClosetItems(): Promise<ClothingItem[]> {
  const items = await get<ClothingItem[]>(CLOSET_KEY);
  return items || [];
}

export async function addClosetItem(imageUrl: string, category: Category): Promise<ClothingItem> {
  const newItem: ClothingItem = {
    id: uuidv4(),
    imageUrl,
    category,
    createdAt: Date.now(),
  };
  
  await update(CLOSET_KEY, (val) => {
    const items = (val as ClothingItem[]) || [];
    return [...items, newItem];
  });
  
  return newItem;
}

export async function deleteClosetItem(id: string): Promise<void> {
  await update(CLOSET_KEY, (val) => {
    const items = (val as ClothingItem[]) || [];
    return items.filter(item => item.id !== id);
  });
}

export async function getSavedOutfits(): Promise<Outfit[]> {
  const outfits = await get<Outfit[]>(OUTFITS_KEY);
  return outfits || [];
}

export async function saveOutfit(items: ClothingItem[]): Promise<Outfit> {
  const newOutfit: Outfit = {
    id: uuidv4(),
    items,
    createdAt: Date.now(),
  };
  
  await update(OUTFITS_KEY, (val) => {
    const outfits = (val as Outfit[]) || [];
    return [...outfits, newOutfit];
  });
  
  return newOutfit;
}

export async function deleteOutfit(id: string): Promise<void> {
  await update(OUTFITS_KEY, (val) => {
    const outfits = (val as Outfit[]) || [];
    return outfits.filter(outfit => outfit.id !== id);
  });
}

export async function getTryOnImages(): Promise<TryOnImage[]> {
  const tryOns = await get<TryOnImage[]>(TRYON_KEY);
  return tryOns || [];
}

export async function saveTryOnImage(imageUrl: string, outfitId: string): Promise<TryOnImage> {
  const newTryOn: TryOnImage = {
    id: uuidv4(),
    imageUrl,
    outfitId,
    createdAt: Date.now(),
  };
  
  await update(TRYON_KEY, (val) => {
    const tryOns = (val as TryOnImage[]) || [];
    return [...tryOns, newTryOn];
  });
  
  return newTryOn;
}

export async function deleteTryOnImage(id: string): Promise<void> {
  await update(TRYON_KEY, (val) => {
    const tryOns = (val as TryOnImage[]) || [];
    return tryOns.filter(tryOn => tryOn.id !== id);
  });
}

export async function getStylePreference(): Promise<string> {
  const pref = await get<string>(STYLE_PREF_KEY);
  return pref || 'ANY';
}

export async function saveStylePreference(pref: string): Promise<void> {
  await set(STYLE_PREF_KEY, pref);
}
