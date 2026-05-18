"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { ClothingItem } from "./db";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function generateOutfitRecommendation(
  items: ClothingItem[],
  lockedItemIdsArray: string[],
  stylePreference: string,
  dominantColor: string,
  mode: "shuffle" | "variation",
  currentOutfitIds: string[],
): Promise<string[]> {
  const lockedItemIds = new Set(lockedItemIdsArray);
  const MAX_ITEMS_TO_SEND = 10;
  
  const lockedItems = items.filter((item) => lockedItemIds.has(item.id));
  const unlockedItems = items.filter((item) => !lockedItemIds.has(item.id));

  const shuffledUnlocked = [...unlockedItems].sort(() => 0.5 - Math.random());
  const itemsToSend = [...lockedItems, ...shuffledUnlocked].slice(0, MAX_ITEMS_TO_SEND);

  const content: any[] = [];
  
  const stylePrompt =
    stylePreference !== "ANY"
      ? `CRITICAL INSTRUCTION: The user has requested a strictly **${stylePreference}** style outfit.`
      : `Create a cohesive look.`;

  const colorPrompt =
    dominantColor !== "ANY"
      ? `CRITICAL INSTRUCTION: The dominant color must be **${dominantColor}**.`
      : ``;

  let promptText = `You are an expert fashion stylist. I have provided images of clothing items.
    
    ${stylePrompt}
    ${colorPrompt}
    
    Rules:
    1. You MUST include any items that have "isLocked": true in the metadata.
    2. The outfit should generally include a Top, Bottom, and Shoes.
    3. Return ONLY a JSON object: {"selectedItemIds": ["id1", "id2", ...]}
    Do not include any other text.`;

  if (mode === "variation" && currentOutfitIds.length > 0) {
    promptText += `\n\n4. Provide a VARIATION of current outfit: ${currentOutfitIds.join(", ")}.`;
  } else if (mode === "shuffle" && currentOutfitIds.length > 0) {
    promptText += `\n\n4. Provide a DIFFERENT outfit than: ${currentOutfitIds.join(", ")}.`;
  }

  content.push({ type: "text", text: promptText });

  const metadata = itemsToSend.map(item => ({
    id: item.id,
    category: item.category,
    isLocked: lockedItemIds.has(item.id)
  }));
  
  content.push({ type: "text", text: `Item Metadata: ${JSON.stringify(metadata)}` });

  for (const item of itemsToSend) {
    content.push({
      type: "image",
      image: item.imageUrl
    });
  }

  try {
    const { text } = await generateText({
      model: openrouter("moonshotai/kimi-k2.6"),
      messages: [{ role: "user", content }],
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);
    return parsed.selectedItemIds || [];
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return [];
  }
}
