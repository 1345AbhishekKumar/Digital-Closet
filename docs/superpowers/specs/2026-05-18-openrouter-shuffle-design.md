# Design Spec: OpenRouter Outfit Shuffle Integration

## Overview
This document outlines the replacement of the NVIDIA-based outfit recommendation (shuffle) logic with a direct integration via OpenRouter using the `moonshotai/kimi-k2.6` model. Other NVIDIA-powered features, such as Item Generation and Virtual Try-On, will remain unchanged.

## Goals
- Replace `generateNvidiaOutfitRecommendation` with an OpenRouter-based implementation.
- Use the Vercel AI SDK and OpenRouter AI SDK provider.
- Maintain existing functionality for "Shuffle" and "Variation" modes in the UI.
- Ensure "Try-On" and "Item Generation" features (using NVIDIA Flux) continue to work.

## Architecture

### 1. New Service: `lib/openrouter.ts`
A new server-side utility file will be created to handle communication with OpenRouter.

- **Initialization**:
  - Use `createOpenRouter` from `@openrouter/ai-sdk-provider`.
  - API Key: `OPENROUTER_API_KEY` (from environment variables).
- **Function**: `generateOutfitRecommendation`
  - **Inputs**: 
    - `items`: `ClothingItem[]`
    - `lockedItemIds`: `string[]`
    - `stylePreference`: `string`
    - `dominantColor`: `string`
    - `mode`: `'shuffle' | 'variation'`
    - `currentOutfitIds`: `string[]`
  - **Logic**:
    - Select a subset of items to send (prioritizing locked items).
    - Construct a vision-capable message content array containing:
      - A system prompt defining the stylist role and rules.
      - Metadata for each item.
      - Image parts for each item (Base64 data).
    - Use `generateText` from the `ai` SDK.
    - Parse the resulting JSON to return `selectedItemIds`.

### 2. Pruning: `lib/nvidia-flux.ts`
- Remove the `generateNvidiaOutfitRecommendation` function.
- Keep `generateNvidiaImage` and `generateNvidiaTryOn` untouched.

### 3. UI Update: `components/tabs/GeneratorTab.tsx`
- Update the import to use `generateOutfitRecommendation` from `@/lib/openrouter`.
- The call signature will remain largely compatible with the previous implementation to minimize UI-side logic changes.

## Data Flow
1. User clicks "SHUFFLE" or "VARIATION" in `GeneratorTab`.
2. UI compresses clothing item images.
3. UI calls `generateOutfitRecommendation` (OpenRouter).
4. OpenRouter returns a JSON list of item IDs.
5. UI updates the `generatedOutfit` state.

## Security & Environment
- Requires `OPENROUTER_API_KEY` in `.env`.
- Ensure `NVIDIA_API_KEY` is still present for the remaining NVIDIA features.

## Testing Strategy
- **Manual Verification**:
  - Verify "Shuffle" returns a cohesive outfit.
  - Verify "Variation" changes only a few items while keeping locked ones.
  - Verify "Virtual Try-On" still works.
  - Verify "Generate Item" in the Generator tab (if applicable) or via its modal still works.
