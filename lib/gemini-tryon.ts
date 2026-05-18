"use server";

import { generateText, experimental_generateImage as generateImage } from "ai";
import { openrouter } from "./openrouter";
import { Outfit } from "./db";

export async function generateTryOn(
  personImage: string,
  outfit: Outfit
) {
  // Step 1: Describe the outfit items to get a cohesive fashion description
  // This helps the image generator understand the style, colors, and textures better.
  const outfitDescriptionContent: any[] = [
    { type: "text", text: "Describe these clothing items in a single cohesive fashion description for a virtual try-on task. Focus on style, material, color, and fit. Be precise and professional." }
  ];

  // We limit to the first 2 items for visual reference to respect image limits (3 total including person),
  // but describe all items in text.
  const visualItems = outfit.items.slice(0, 2);
  const otherItems = outfit.items.slice(2);

  for (const item of outfit.items) {
    outfitDescriptionContent.push({
      type: "image",
      image: item.imageUrl
    });
  }

  let fashionDescription = "";
  try {
    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"), // Using a fast, smart model for description
      messages: [{ role: "user", content: outfitDescriptionContent }],
    });
    fashionDescription = text;
  } catch (error) {
    console.error("Description generation failed:", error);
    fashionDescription = outfit.items.map(i => `${i.category}`).join(", ");
  }

  // Step 2: Generate the try-on image using the description and the images
  // We pass the person image first, then the visual clothing items.
  const result = await generateImage({
    model: openrouter.imageModel(
      "google/gemini-2.5-flash-image"
    ),

    prompt: `
Create a high-fidelity, photorealistic virtual try-on image.

INSTRUCTIONS:
1. Take the person from the first image (the Avatar) and dress them in the outfit described below.
2. Use the subsequent clothing images as the primary visual reference for the items.

OUTFIT DESCRIPTION:
${fashionDescription}

CONSTRAINTS:
1. **Preserve Person's Identity**: The person's original features—including their face, hair, body shape, skin tone, and pose—must remain completely unchanged and preserved with high fidelity.
2. **Seamless Integration**: The clothing must fit the person's body naturally, following their pose and contours, with realistic shadows, fabric folds, and lighting that matches the original scene.
3. **Background Preservation**: Keep the background of the first image intact.
4. **Style Accuracy**: Ensure the textures (e.g., silk, denim, cotton) and colors match the reference images exactly.

Professional ecommerce fashion photoshoot style.
`,

    images: [
      personImage,
      ...visualItems.map(item => item.imageUrl)
    ],

    size: "1024x1024",
  });

  return {
    imageUrl: result.image.url || `data:image/png;base64,${result.image.base64}`
  };
}
