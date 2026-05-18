import { create } from 'zustand';
import { getClosetItems, addClosetItem, deleteClosetItem, getSavedOutfits, saveOutfit as dbSaveOutfit, deleteOutfit, getStylePreference, saveStylePreference as dbSaveStylePreference, getTryOnImages, saveTryOnImage, deleteTryOnImage, ClothingItem, Outfit, Category, TryOnImage } from '@/lib/db';

interface ClosetState {
  activeTab: 'closet' | 'generator' | 'saved' | 'tryons';
  setActiveTab: (tab: 'closet' | 'generator' | 'saved' | 'tryons') => void;

  items: ClothingItem[];
  outfits: Outfit[];
  tryOnImages: TryOnImage[];
  stylePreference: string;
  dominantColor: string;
  setDominantColor: (color: string) => void;
  
  loadData: () => Promise<void>;
  
  // Closet Tab state
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
  selectedItemIds: Set<string>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  deleteSelectedItems: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Upload state
  uploadImage: string | null;
  setUploadImage: (img: string | null) => void;
  uploadCategory: Category;
  setUploadCategory: (cat: Category) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  saveUploadedItem: () => Promise<void>;

  // Generate Item state
  isGenerateModalOpen: boolean;
  setIsGenerateModalOpen: (val: boolean) => void;
  generatePrompt: string;
  setGeneratePrompt: (prompt: string) => void;
  isGeneratingItem: boolean;
  setIsGeneratingItem: (val: boolean) => void;

  // Generator state
  generatedOutfit: ClothingItem[];
  setGeneratedOutfit: (outfit: ClothingItem[]) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  flickerImage: string | null;
  setFlickerImage: (img: string | null) => void;
  lockedItemIds: Set<string>;
  toggleLock: (id: string) => void;
  setStylePreference: (pref: string) => Promise<void>;
  saveCurrentOutfit: () => Promise<void>;

  // Try-On State
  modelImage: string | null;
  setModelImage: (img: string | null) => void;
  isTryOnModalOpen: boolean;
  setIsTryOnModalOpen: (val: boolean) => void;
  tryOnResultImage: string | null;
  setTryOnResultImage: (img: string | null) => void;
  isTryingOn: boolean;
  setIsTryingOn: (val: boolean) => void;
  currentTryOnOutfitId: string | null;
  setCurrentTryOnOutfitId: (id: string | null) => void;
  
  deleteSavedOutfit: (id: string) => Promise<void>;
  deleteSavedTryOn: (id: string) => Promise<void>;
  addTryOnResult: (imageUrl: string, outfitId: string) => Promise<void>;
}

export const useClosetStore = create<ClosetState>((set, get) => ({
  activeTab: 'closet',
  setActiveTab: (tab) => set({ activeTab: tab }),

  items: [],
  outfits: [],
  tryOnImages: [],
  stylePreference: 'ANY',
  dominantColor: 'ANY',
  setDominantColor: (color) => set({ dominantColor: color }),

  loadData: async () => {
    const [items, outfits, stylePreference, tryOnImages] = await Promise.all([
      getClosetItems(),
      getSavedOutfits(),
      getStylePreference(),
      getTryOnImages()
    ]);
    set({ items, outfits, stylePreference, tryOnImages });
  },

  isSelectionMode: false,
  setIsSelectionMode: (val) => set({ isSelectionMode: val }),
  selectedItemIds: new Set(),
  toggleSelection: (id) => {
    const next = new Set(get().selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedItemIds: next });
  },
  clearSelection: () => set({ selectedItemIds: new Set() }),
  deleteSelectedItems: async () => {
    const { selectedItemIds, loadData } = get();
    for (const id of selectedItemIds) {
      await deleteClosetItem(id);
    }
    set({ selectedItemIds: new Set(), isSelectionMode: false });
    await loadData();
  },
  deleteItem: async (id) => {
    await deleteClosetItem(id);
    await get().loadData();
  },

  uploadImage: null,
  setUploadImage: (img) => set({ uploadImage: img }),
  uploadCategory: 'Tops',
  setUploadCategory: (cat) => set({ uploadCategory: cat }),
  isUploading: false,
  setIsUploading: (val) => set({ isUploading: val }),
  saveUploadedItem: async () => {
    const { uploadImage, uploadCategory, loadData } = get();
    if (!uploadImage) return;
    await addClosetItem(uploadImage, uploadCategory);
    set({ uploadImage: null, isUploading: false });
    await loadData();
  },

  isGenerateModalOpen: false,
  setIsGenerateModalOpen: (val) => set({ isGenerateModalOpen: val }),
  generatePrompt: '',
  setGeneratePrompt: (prompt) => set({ generatePrompt: prompt }),
  isGeneratingItem: false,
  setIsGeneratingItem: (val) => set({ isGeneratingItem: val }),

  generatedOutfit: [],
  setGeneratedOutfit: (outfit) => set({ generatedOutfit: outfit }),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
  flickerImage: null,
  setFlickerImage: (img) => set({ flickerImage: img }),
  lockedItemIds: new Set(),
  toggleLock: (id) => {
    const newSet = new Set(get().lockedItemIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    set({ lockedItemIds: newSet });
  },
  setStylePreference: async (pref) => {
    await dbSaveStylePreference(pref);
    set({ stylePreference: pref });
  },
  saveCurrentOutfit: async () => {
    const { generatedOutfit, loadData } = get();
    if (generatedOutfit.length === 0) return;
    await dbSaveOutfit(generatedOutfit);
    await loadData();
    set({ activeTab: 'saved' });
  },

  modelImage: null,
  setModelImage: (img) => set({ modelImage: img }),
  isTryOnModalOpen: false,
  setIsTryOnModalOpen: (val) => set({ isTryOnModalOpen: val }),
  tryOnResultImage: null,
  setTryOnResultImage: (img) => set({ tryOnResultImage: img }),
  isTryingOn: false,
  setIsTryingOn: (val) => set({ isTryingOn: val }),
  currentTryOnOutfitId: null,
  setCurrentTryOnOutfitId: (id) => set({ currentTryOnOutfitId: id }),

  deleteSavedOutfit: async (id) => {
    await deleteOutfit(id);
    await get().loadData();
  },
  deleteSavedTryOn: async (id) => {
    await deleteTryOnImage(id);
    await get().loadData();
  },
  addTryOnResult: async (imageUrl, outfitId) => {
    await saveTryOnImage(imageUrl, outfitId);
    await get().loadData();
  }
}));
