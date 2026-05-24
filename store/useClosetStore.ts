import { create } from 'zustand';
import { 
  ClothingItem, 
  Category
} from '@/lib/db';

interface ClosetState {
  activeTab: 'closet' | 'generator' | 'saved' | 'tryons';
  setActiveTab: (tab: 'closet' | 'generator' | 'saved' | 'tryons') => void;

  dominantColor: string;
  setDominantColor: (color: string) => void;
  
  // Closet Tab state
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
  selectedItemIds: Set<string>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  // Upload state
  uploadImage: string | null;
  setUploadImage: (img: string | null) => void;
  uploadCategory: Category;
  setUploadCategory: (cat: Category) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;

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

  // Try-On State
  isTryOnModalOpen: boolean;
  setIsTryOnModalOpen: (val: boolean) => void;
  tryOnResultImage: string | null;
  setTryOnResultImage: (img: string | null) => void;
  isTryingOn: boolean;
  setIsTryingOn: (val: boolean) => void;
  currentTryOnOutfitId: string | null;
  setCurrentTryOnOutfitId: (id: string | null) => void;
}

export const useClosetStore = create<ClosetState>((set, get) => ({
  activeTab: 'closet',
  setActiveTab: (tab) => set({ activeTab: tab }),

  dominantColor: 'ANY',
  setDominantColor: (color) => set({ dominantColor: color }),

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

  uploadImage: null,
  setUploadImage: (img) => set({ uploadImage: img }),
  uploadCategory: 'Tops',
  setUploadCategory: (cat) => set({ uploadCategory: cat }),
  isUploading: false,
  setIsUploading: (val) => set({ isUploading: val }),

  isGenerateModalOpen: false,
  setIsGenerateModalOpen: (val) => set({ isGenerateModalOpen: val }),
  generatePrompt: '',
  setGeneratePrompt: (prompt) => set({ generatePrompt: prompt }),
  isGeneratingItem: false,
  setIsGeneratingItem: (val: boolean) => set({ isGeneratingItem: val }),

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

  isTryOnModalOpen: false,
  setIsTryOnModalOpen: (val) => set({ isTryOnModalOpen: val }),
  tryOnResultImage: null,
  setTryOnResultImage: (img) => set({ tryOnResultImage: img }),
  isTryingOn: false,
  setIsTryingOn: (val) => set({ isTryingOn: val }),
  currentTryOnOutfitId: null,
  setCurrentTryOnOutfitId: (id) => set({ currentTryOnOutfitId: id }),
}));
