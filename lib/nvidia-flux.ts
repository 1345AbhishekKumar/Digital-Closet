"use server";

import { ClothingItem, Outfit } from "./db";

export async function generateNvidiaImage(prompt: string) {
  const invokeUrl =
    "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b";

  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not set in the environment variables.");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const payload = {
    prompt: prompt,
    width: 1024,
    height: 1024,
    seed: 0,
    steps: 4,
  };

  const response = await fetch(invokeUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(
      `Invocation failed with status ${response.status}: ${errBody}`,
    );
  }

  const responseBody = await response.json();
  return responseBody;
}
