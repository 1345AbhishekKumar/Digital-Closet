import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getClosetItems, 
  addClosetItem, 
  deleteClosetItem, 
  getSavedOutfits, 
  saveOutfit as dbSaveOutfit, 
  deleteOutfit, 
  getStylePreference, 
  saveStylePreference as dbSaveStylePreference, 
  getTryOnImages, 
  saveTryOnImage, 
  deleteTryOnImage,
  getModelImage,
  saveModelImage
} from '@/lib/db';

// Keys for TanStack Query
export const closetKeys = {
  all: ['closet'] as const,
  items: () => [...closetKeys.all, 'items'] as const,
  outfits: () => [...closetKeys.all, 'outfits'] as const,
  stylePreference: () => [...closetKeys.all, 'stylePreference'] as const,
  tryOnImages: () => [...closetKeys.all, 'tryOnImages'] as const,
  modelImage: () => [...closetKeys.all, 'modelImage'] as const,
};

// --- Queries ---

export function useClosetItems() {
  return useQuery({
    queryKey: closetKeys.items(),
    queryFn: getClosetItems,
  });
}

export function useSavedOutfits() {
  return useQuery({
    queryKey: closetKeys.outfits(),
    queryFn: getSavedOutfits,
  });
}

export function useStylePreference() {
  return useQuery({
    queryKey: closetKeys.stylePreference(),
    queryFn: getStylePreference,
  });
}

export function useTryOnImages() {
  return useQuery({
    queryKey: closetKeys.tryOnImages(),
    queryFn: getTryOnImages,
  });
}

export function useModelImage() {
  return useQuery({
    queryKey: closetKeys.modelImage(),
    queryFn: getModelImage,
  });
}

// --- Mutations ---

export function useAddClosetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ image, category }: { image: string, category: any }) => 
      addClosetItem(image, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
    },
  });
}

export function useDeleteSelectedItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await deleteClosetItem(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
    },
  });
}

export function useDeleteClosetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClosetItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.items() });
    },
  });
}

export function useSaveOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: any[]) => dbSaveOutfit(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });
}

export function useDeleteOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOutfit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.outfits() });
    },
  });
}

export function useUpdateStylePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pref: string) => dbSaveStylePreference(pref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.stylePreference() });
    },
  });
}

export function useSaveModelImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (img: string | null) => saveModelImage(img),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.modelImage() });
    },
  });
}

export function useAddTryOnResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageUrl, outfitId }: { imageUrl: string, outfitId: string }) => 
      saveTryOnImage(imageUrl, outfitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.tryOnImages() });
    },
  });
}

export function useDeleteTryOnImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTryOnImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: closetKeys.tryOnImages() });
    },
  });
}
