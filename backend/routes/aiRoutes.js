const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const router = express.Router();

const imageRepository = require("../repositories/imageRepository");
const ebayService = require("../services/ebayService");
const { GoogleGenAI } = require("@google/genai");
const mime = require("mime-types");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const isRemoteUrl = (imageUrl) => /^https?:\/\//i.test(imageUrl);

const buildGeminiImage = async ({ imageUrl, imageBase64 }) => {
  let base64Data;
  let mimeType = "image/jpeg";

  if (imageBase64) {
    base64Data = imageBase64;
  } else if (isRemoteUrl(imageUrl)) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Unable to download image.");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    base64Data = buffer.toString("base64");
    mimeType = response.headers.get("content-type") || "image/jpeg";
  } else {
    const normalizedImageUrl = imageUrl.replace(/^[/\\]+/, "");
    const localImagePath = path.resolve(__dirname, "..", normalizedImageUrl);

    const imageBuffer = await fs.readFile(localImagePath);

    base64Data = imageBuffer.toString("base64");
    mimeType = mime.lookup(localImagePath) || "image/jpeg";
  }

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
};

const analyzeGeminiImage = async (geminiImage) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          geminiImage,
          {
            text: `
Analyze this image and return ONLY a valid JSON object with no markdown formatting or extra text:

{
  "brand": "",
  "model": "",
  "category": "",
  "color": "",
  "visibleText": "",
  "tags": [],
  "description": ""
}
`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  console.log("========== GEMINI RESPONSE OBJECT ==========");
  console.log("Full response:", JSON.stringify(response, null, 2));
  console.log("Response type:", typeof response);
  console.log("Response keys:", Object.keys(response));
  console.log("==========================================");

  let text = "";

  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    text = response.candidates[0].content.parts[0].text.trim();
  } else if (typeof response.text === "function") {
    text = response.text().trim();
  } else if (typeof response === "string") {
    text = response.trim();
  } else {
    throw new Error("Could not extract text from Gemini response.");
  }
  console.log("========== TEXT EXTRACTED ==========");
  console.log(text);
  console.log("====================================");

  // Remove markdown code blocks if present
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // If still no JSON, try to extract JSON from the response
  if (!cleaned.startsWith("{")) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  console.log("========== CLEANED JSON ==========");
  console.log(cleaned);
  console.log("==================================");

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("❌ Failed to parse Gemini response as JSON:", {
      text,
      cleaned,
      errorMessage: error.message,
    });
    throw new Error(`Invalid JSON response from Gemini API: ${error.message}`);
  }

  return {
    labels: parsed.model || "",
    logos: parsed.brand || "",
    objects: Array.isArray(parsed.objects) ? parsed.objects : [],
    visibleText: parsed.visibleText || "",
    aiTags: Array.isArray(parsed.tags) ? parsed.tags : [],
    aiDescription: JSON.stringify(parsed),
  };
};

const resolveImageContext = async ({ imageId, imageUrl, imageBase64 }) => {
  if (imageId) {
    const image = await imageRepository.getImageById(imageId);
    if (!image) {
      const error = new Error("Image not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      imageId,
      image,
      geminiImage: await buildGeminiImage({
        imageUrl,
        imageBase64,
      }),
    };
  }

  if (imageUrl || imageBase64) {
    return {
      imageId: null,
      image: {
        imageUrl,
        aiTags: [],
        aiDescription: "",
      },
      geminiImage: await buildGeminiImage({
        imageUrl,
        imageBase64,
      }),
    };
  }

  const error = new Error("Image ID or image URL is required");
  error.statusCode = 400;
  throw error;
};

const handleProcessImage = async (req, res, next) => {
  try {
    const { imageId, imageUrl, imageBase64, userDescription } = req.body;

    console.log("Starting image processing...");

    const resolved = await resolveImageContext({
      imageId,
      imageUrl,
      imageBase64,
    });

    console.log("Image built successfully");

    const geminiResult = await analyzeGeminiImage(resolved.geminiImage);

    console.log("Gemini result:", geminiResult);

    const updatedImage = resolved.imageId
      ? await imageRepository.updateImageById(resolved.imageId, {
          aiTags: geminiResult.aiTags,
          aiDescription: geminiResult.aiDescription,
        })
      : {
          ...resolved.image,
          aiTags: geminiResult.aiTags,
          aiDescription: geminiResult.aiDescription,
        };

    const ebayQuery = buildEbaySearchQuery({
      image: updatedImage,
      userDescription,
    });

    res.status(200).json({
      success: true,
      message: "Image processing completed successfully",
      image: updatedImage,
      ebayQuery,
      nextRoute: "/api/ebay",
      gemini: {
        labels: geminiResult.labels,
        logos: geminiResult.logos,
        objects: geminiResult.objects,
        text: geminiResult.visibleText,
      },
    });
  } catch (error) {
    console.error("================================");
    console.error(error);
    console.error(error.stack);
    console.error("================================");
    next(error);
  }
};

router.post("/", handleProcessImage);
router.post("/process-image", handleProcessImage);

const normalizeEbayCondition = (condition) => {
  if (!condition) return null;
  const normalized = condition.toString().trim().toLowerCase();
  if (normalized.includes("new")) return 1000;
  if (normalized.includes("open")) return 1500;
  if (normalized.includes("refurb")) return 2000;
  if (normalized.includes("used")) return 3000;
  return null;
};

const parseAiDescription = (aiDescription = "") => {
  try {
    return JSON.parse(aiDescription);
  } catch {
    return {
      brand: "",
      model: "",
      category: "",
      color: "",
      visibleText: "",
      aiTags: [],
      aiDescription: "",
    };
  }
};

const buildEbaySearchQuery = ({ image, userDescription }) => {
  const analysis = parseAiDescription(image.aiDescription);

  const parts = [
    ...(analysis.tags || []),
    analysis.visibleText,
    userDescription,
  ];

  return parts
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
};

// expose the query builder for tests
router.buildEbaySearchQuery = buildEbaySearchQuery;

router.post("/search-ebay", async (req, res, next) => {
  try {
    const {
      imageId,
      imageUrl,
      imageBase64,
      aiTags,
      aiDescription,
      condition,
      userDescription,
    } = req.body;

    let image =
      aiTags || aiDescription
        ? {
            imageUrl,
            aiTags: aiTags || [],
            aiDescription: aiDescription || "",
          }
        : null;

    let resolved = null;

    if (!image) {
      resolved = await resolveImageContext({ imageId, imageUrl, imageBase64 });
      image = resolved.image;
    }

    if (
      !buildEbaySearchQuery({ image, userDescription }) &&
      resolved?.geminiImage
    ) {
      const geminiResult = await analyzeGeminiImage(resolved.geminiImage);
      image = {
        ...image,
        aiTags: geminiResult.aiTags,
        aiDescription: geminiResult.aiDescription,
      };
    }
    console.log("Request body:", req.body);
    console.log("imageData:", req.body.imageData);
    console.log("description:", req.body.description);
    console.log("Image:", JSON.stringify(image, null, 2));
    const analysis = parseAiDescription(image.aiDescription);

    console.log("Analysis:", analysis);
    // express.set("Analysis", analysis);
    console.log({
      brand: analysis.brand,
      model: analysis.model,
      category: analysis.category,
      labels: analysis.labels,
      tags: analysis.tags,
    });

    const query = buildEbaySearchQuery({ image, userDescription });

    console.log("Generated query:", query);
    if (!query) {
      const error = new Error(
        "Please provide image data or a description to search eBay",
      );
      error.statusCode = 400;
      throw error;
    }

    const conditionId = normalizeEbayCondition(condition);
    const ebayResults = await ebayService.searchItems(query, conditionId, 12);

    res.status(200).json({
      success: true,
      message: "eBay search completed successfully",
      query,
      conditionId,
      ebayResults,
      analysis: {
        brand: analysis.brand,
        title: analysis.model,
        category: analysis.category,
        labels: analysis.labels,
        tags: analysis.tags,
      },
    });
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    next(error);
  }
});

module.exports = router;