"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Outfit } from "./db";

const getAiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
};

export const generateTryOn = async (
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
      model: "gemini-2.5-flash-image",
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

// export const generateSingleItemImageApi = async (
//   prompt: string,
// ): Promise<string> => {
//   const ai = getAiInstance();
//   let response;
//   try {
//     response = await ai.models.generateContent({
//       model: "gemini-2.5-flash-image",
//       contents: {
//         parts: [
//           {
//             text: `A high-quality, studio lighting photograph of a single clothing item on a clean white background. The item is: ${prompt}. It should be clearly visible and isolated.`,
//           },
//         ],
//       },
//     });
//   } catch (error: any) {
//     if (
//       error?.status === "RESOURCE_EXHAUSTED" ||
//       error?.message?.includes("429") ||
//       error?.message?.includes("quota")
//     ) {
//       throw new Error(
//         "We've reached our AI API usage limits. Please check your Google AI Studio billing details or try again later.",
//       );
//     }
//     console.error("Gemini API error (Single Item):", error);
//     throw new Error("Failed to generate image.");
//   }

//   for (const part of response.candidates?.[0]?.content?.parts || []) {
//     if (part.inlineData?.data) {
//       return `data:image/jpeg;base64,${part.inlineData.data}`;
//     }
//   }
//   throw new Error("No image generated");
// };
