"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Outfit } from "./db";

const getAiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
};

export const generateTryOnImageApi = async (
  modelImage: string,
  outfit: Outfit,
): Promise<string> => {
  const ai = getAiInstance();
  const parts: any[] = [
    {
      text: "Create a photorealistic image of the person from the first image wearing the exact clothing items provided in the following images. Ensure the clothes fit naturally on the person's body and match the style.",
    },
  ];

  const modelBase64 = modelImage.split(",")[1];
  const modelMime = modelImage.split(";")[0].split(":")[1];
  parts.push({ inlineData: { data: modelBase64, mimeType: modelMime } });

  for (const item of outfit.items) {
    const itemBase64 = item.imageUrl.split(",")[1];
    const itemMime = item.imageUrl.split(";")[0].split(":")[1];
    parts.push({ inlineData: { data: itemBase64, mimeType: itemMime } });
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts },
    });
  } catch (error: any) {
    if (
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota")
    ) {
      throw new Error(
        "We've reached our AI API usage limits. Please check your Google AI Studio billing details or try again later.",
      );
    }
    console.error("Gemini API error (Try-On):", error);
    throw new Error("Failed to generate image.");
  }

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateSingleItemImageApi = async (
  prompt: string,
): Promise<string> => {
  const ai = getAiInstance();
  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          {
            text: `A high-quality, studio lighting photograph of a single clothing item on a clean white background. The item is: ${prompt}. It should be clearly visible and isolated.`,
          },
        ],
      },
    });
  } catch (error: any) {
    if (
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota")
    ) {
      throw new Error(
        "We've reached our AI API usage limits. Please check your Google AI Studio billing details or try again later.",
      );
    }
    console.error("Gemini API error (Single Item):", error);
    throw new Error("Failed to generate image.");
  }

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateOutfitRecommendationApi = async (
  items: ClothingItem[],
  lockedItemIdsArray: string[],
  stylePreference: string,
  dominantColor: string,
  mode: "shuffle" | "variation",
  currentOutfitIds: string[],
): Promise<string[]> => {
  const lockedItemIds = new Set(lockedItemIdsArray);
  const ai = getAiInstance();
  const MAX_ITEMS_TO_SEND = 15;
  const lockedItems = items.filter((item) => lockedItemIds.has(item.id));
  const unlockedItems = items.filter((item) => !lockedItemIds.has(item.id));

  const shuffledUnlocked = [...unlockedItems].sort(() => 0.5 - Math.random());
  const itemsToSend = [...lockedItems, ...shuffledUnlocked].slice(
    0,
    MAX_ITEMS_TO_SEND,
  );

  const parts: any[] = [];
  const availableItems = itemsToSend.map((item) => {
    const base64Data = item.imageUrl.split(",")[1];
    const mimeType = item.imageUrl.split(";")[0].split(":")[1];

    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
    return {
      id: item.id,
      category: item.category,
      isLocked: lockedItemIds.has(item.id),
    };
  });

  const stylePrompt =
    stylePreference !== "ANY"
      ? `CRITICAL INSTRUCTION: The user has explicitly requested a strictly **${stylePreference}** style outfit. You MUST prioritize items that clearly fit the ${stylePreference} aesthetic. Ensure the final generated outfit is highly cohesive within the ${stylePreference} style. Do not mix clashing styles unless it serves the ${stylePreference} look.`
      : `The user has no specific style preference, create a cohesive look.`;

  const colorPrompt =
    dominantColor !== "ANY"
      ? `CRITICAL INSTRUCTION: The user has explicitly requested that the dominant color of the outfit be **${dominantColor}**. You MUST prioritize items that match or complement this color. Ensure the final generated outfit has a strong presence of ${dominantColor}.`
      : ``;

  let promptText = `You are an expert fashion stylist. I have provided images of clothing items in my closet. 
    Here is the metadata for the items in the same order as the images:
    ${JSON.stringify(availableItems, null, 2)}
    
    ${stylePrompt}
    ${colorPrompt}
    
    Please select a cohesive, stylish outfit from these items.
    Rules:
    1. You MUST include any items that have "isLocked": true.
    2. The outfit should generally include a Top, Bottom, and Shoes, plus optional Outerwear or Accessories.
    3. Return ONLY the IDs of the selected items.`;

  if (mode === "variation" && currentOutfitIds.length > 0) {
    promptText += `\n\n4. The user wants a VARIATION of their current outfit (IDs: ${currentOutfitIds.join(", ")}). Keep the locked items, but swap out 1 or 2 of the unlocked items for something else that still works well to create a slightly different look.`;
  } else if (mode === "shuffle" && currentOutfitIds.length > 0) {
    promptText += `\n\n4. Please try to provide a DIFFERENT outfit than the current one (IDs: ${currentOutfitIds.join(", ")}), while still respecting locked items.`;
  }

  parts.push({ text: promptText });

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedItemIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "The IDs of the clothing items selected for the outfit.",
            },
          },
          required: ["selectedItemIds"],
        },
      },
    });
  } catch (error: any) {
    if (
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota")
    ) {
      throw new Error(
        "We've reached our AI API usage limits. Please check your Google AI Studio billing details or try again later.",
      );
    }
    console.error("Gemini API error (Outfit Recommendation):", error);
    throw new Error("Failed to generate outfit recommendation.");
  }

  const result = JSON.parse(response.text || "{}");
  return result.selectedItemIds || [];
};
