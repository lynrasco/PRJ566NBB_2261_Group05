const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();

const imageRepository = require("../repositories/imageRepository");

let geminiClient;

const isRemoteUrl = (imageUrl) => /^https?:\/\//i.test(imageUrl);

const getImageAsBase64 = async (imageUrl) => {
  if (isRemoteUrl(imageUrl)) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      const error = new Error("Unable to download image for processing");
      error.statusCode = 400;
      throw error;
    }

    const arrayBuffer = await response.arrayBuffer();

    return {
      data: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: response.headers.get("content-type") || "image/jpeg",
    };
  }

  const normalizedImageUrl = imageUrl.replace(/^[/\\]+/, "");
  const localImagePath = path.resolve(__dirname, "..", normalizedImageUrl);
  const imageContent = await fs.readFile(localImagePath);

  return {
    data: imageContent.toString("base64"),
    mimeType: getMimeType(imageUrl),
  };
};

const getMimeType = (imageUrl) => {
  const extension = path.extname(imageUrl).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
};

const extractJson = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    const error = new Error("Gemini did not return valid JSON");
    error.statusCode = 502;
    throw error;
  }

  return JSON.parse(jsonMatch[0]);
};

const buildGeminiPrompt = () => {
  return `
Analyze this product image for a resale marketplace app.

Return only valid JSON with this exact structure:
{
  "productName": "string",
  "category": "string",
  "subcategory": "string",
  "brand": "string or unknown",
  "condition": "New | Like New | Good | Fair | Poor | Unknown",
  "conditionReasoning": "string",
  "aiTags": ["string"],
  "searchKeywords": ["string"],
  "aiDescription": "string"
}

Rules:
- Base the answer only on visible evidence in the image.
- Use "unknown" when brand or product details are unclear.
- Condition should be an estimate from visible wear, damage, packaging, cleanliness, and age clues.
- aiTags should be short resale/search tags.
- searchKeywords should be useful for finding similar listings on resale platforms.
- Do not include markdown, code fences, or extra explanation.
`;
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
};

router.post("/process-image", async (req, res, next) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      const error = new Error("Image ID is required");
      error.statusCode = 400;
      throw error;
    }

    const image = await imageRepository.getImageById(imageId);

    if (!image) {
      const error = new Error("Image not found");
      error.statusCode = 404;
      throw error;
    }

    const imageData = await getImageAsBase64(image.imageUrl);

    const geminiResponse = await getGeminiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        },
        {
          text: buildGeminiPrompt(),
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const detection = extractJson(geminiResponse.text || "");
    const aiTags = Array.isArray(detection.aiTags) ? detection.aiTags : [];
    const aiDescription = detection.aiDescription || "";

    const updatedImage = await imageRepository.updateImageById(imageId, {
      aiTags,
      aiDescription,
    });

    res.status(200).json({
      success: true,
      message: "Gemini image processing completed successfully",
      image: updatedImage,
      detection,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
