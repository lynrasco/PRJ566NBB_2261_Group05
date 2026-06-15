const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const vision = require("@google-cloud/vision");
const router = express.Router();

const imageRepository = require("../repositories/imageRepository");
const ebayService = require("../services/ebayService");
const localPricingService = require("../services/localPricingService");

const visionClient = new vision.ImageAnnotatorClient();

const isRemoteUrl = (imageUrl) => /^https?:\/\//i.test(imageUrl);

const buildVisionImage = async ({ imageUrl, imageBase64 }) => {
  if (imageBase64) {
    return {
      content: imageBase64,
    };
  }

  if (isRemoteUrl(imageUrl)) {
    return {
      source: {
        imageUri: imageUrl,
      },
    };
  }

  const normalizedImageUrl = imageUrl.replace(/^[/\\]+/, "");
  const localImagePath = path.resolve(__dirname, "..", normalizedImageUrl);
  const imageContent = await fs.readFile(localImagePath);

  return {
    content: imageContent.toString("base64"),
  };
};

const formatAnnotations = (annotations, nameKey = "description") => {
  return annotations.map((annotation) => ({
    description: annotation[nameKey],
    score: annotation.score,
  }));
};

const buildDescription = ({ labels, logos, objects, text }) => {
  const descriptionParts = [
    labels.length
      ? `Likely item tags: ${labels.map((label) => label.description).join(", ")}.`
      : null,
    logos.length
      ? `Visible brand/logo clues: ${logos.map((logo) => logo.description).join(", ")}.`
      : null,
    objects.length
      ? `Detected objects: ${objects.map((object) => object.description).join(", ")}.`
      : null,
    text ? `Visible text: ${text.replace(/\s+/g, " ").trim()}` : null,
  ];

  return descriptionParts.filter(Boolean).join(" ");
};

const analyzeVisionImage = async (visionImage) => {
  const [result] = await visionClient.annotateImage({
    image: visionImage,
    features: [
      { type: "LABEL_DETECTION", maxResults: 10 },
      { type: "LOGO_DETECTION", maxResults: 5 },
      { type: "TEXT_DETECTION", maxResults: 5 },
      { type: "OBJECT_LOCALIZATION", maxResults: 10 },
    ],
  });

  const labels = formatAnnotations(result.labelAnnotations || []);
  const logos = formatAnnotations(result.logoAnnotations || []);
  const objects = formatAnnotations(
    result.localizedObjectAnnotations || [],
    "name"
  );
  const text = result.textAnnotations?.[0]?.description || "";
  const aiTags = labels.map((label) => label.description);
  const aiDescription = buildDescription({ labels, logos, objects, text });

  return {
    labels,
    logos,
    objects,
    text,
    aiTags,
    aiDescription,
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
      visionImage: await buildVisionImage({ imageUrl: image.imageUrl }),
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
      visionImage: await buildVisionImage({ imageUrl, imageBase64 }),
    };
  }

  const error = new Error("Image ID or image URL is required");
  error.statusCode = 400;
  throw error;
};

const handleProcessImage = async (req, res, next) => {
  try {
    const { imageId, imageUrl, imageBase64, userDescription } = req.body;
    const resolved = await resolveImageContext({ imageId, imageUrl, imageBase64 });
    const visionResult = await analyzeVisionImage(resolved.visionImage);

    const updatedImage = resolved.imageId
      ? await imageRepository.updateImageById(resolved.imageId, {
          aiTags: visionResult.aiTags,
          aiDescription: visionResult.aiDescription,
        })
      : {
          ...resolved.image,
          aiTags: visionResult.aiTags,
          aiDescription: visionResult.aiDescription,
        };

    const ebayQuery = buildEbaySearchQuery({
      image: updatedImage,
      userDescription,
    });

    res.status(200).json({
      success: true,
      message: "Google Vision image processing completed successfully",
      image: updatedImage,
      ebayQuery,
      nextRoute: "/api/ebay",
      vision: {
        labels: visionResult.labels,
        logos: visionResult.logos,
        objects: visionResult.objects,
        text: visionResult.text,
      },
    });
  } catch (error) {
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
  const result = {
    brands: [],
    objects: [],
    visibleText: "",
  };

  const desc = aiDescription || "";

  // Extract brands from the 'Visible brand/logo clues:' section
  const brandMatch = desc.match(/Visible brand\/logo clues:\s*([^\.]+)/i);
  if (brandMatch) {
    result.brands = brandMatch[1]
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Extract detected objects
  const objMatch = desc.match(/Detected objects:\s*([^\.]+)/i);
  if (objMatch) {
    result.objects = objMatch[1]
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Extract visible text
  const textMatch = desc.match(/Visible text:\s*([^$]+)/i);
  if (textMatch) {
    result.visibleText = textMatch[1].trim();
  }

  return result;
};

const buildEbaySearchQuery = ({ image, userDescription }) => {
  const parts = [];
  // Parse aiDescription for brand/object/text clues
  const parsed = parseAiDescription(image.aiDescription);

  // Brand first
  if (parsed.brands && parsed.brands.length) {
    parts.push(parsed.brands[0]);
  } else if (image.aiTags && image.aiTags.length) {
    // try to guess brand from tags if any tag looks like a brand (capitalized)
    const brandCandidate = image.aiTags.find((t) => /^[A-Z][a-zA-Z0-9\-]+$/.test(t));
    if (brandCandidate) parts.push(brandCandidate);
  }

  // Model / visible text (prioritize tokens with digits or uppercase model-like strings)
  if (parsed.visibleText) {
    const tokens = parsed.visibleText.split(/\s+/).map((t) => t.trim()).filter(Boolean);
    const modelToken = tokens.find((t) => /\d/.test(t) || /^[A-Z0-9\-]{3,}$/.test(t));
    if (modelToken) parts.push(modelToken);
  }

  // Object (shoe, bottle, jacket, etc.)
  if (parsed.objects && parsed.objects.length) {
    parts.push(parsed.objects[0]);
  } else if (image.aiTags && image.aiTags.length) {
    // pick a non-brand tag as object
    const objCandidate = image.aiTags.find((t) => !parsed.brands.includes(t));
    if (objCandidate) parts.push(objCandidate);
  }

  // User description is powerful — append at the end to refine search
  if (userDescription) parts.push(userDescription);

  // Fallback to cleaned aiDescription if still empty
  if (!parts.length && image.aiDescription) {
    const noUrls = image.aiDescription.replace(/https?:\/\/\S+/gi, "");
    const cleaned = noUrls.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned) parts.push(cleaned);
  }

  const query = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return query.length > 200 ? query.slice(0, 200) : query;
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

    if (!buildEbaySearchQuery({ image, userDescription }) && resolved?.visionImage) {
      const visionResult = await analyzeVisionImage(resolved.visionImage);
      image = {
        ...image,
        aiTags: visionResult.aiTags,
        aiDescription: visionResult.aiDescription,
      };
    }

    const query = buildEbaySearchQuery({ image, userDescription });

    if (!query) {
      const error = new Error("Please provide image data or a description to search eBay");
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
    });
  } catch (error) {
    next(error);
  }
});

router.post("/price-estimate", async (req, res, next) => {
  try {
    const { imageId, imageUrl, imageBase64, condition, userDescription } = req.body;
    const resolved = await resolveImageContext({ imageId, imageUrl, imageBase64 });
    const image = resolved.image;

    const query = buildEbaySearchQuery({ image, userDescription });
    const conditionId = normalizeEbayCondition(condition);
    const ebayResults = await ebayService.searchItems(query, conditionId, 12);
    const priceEstimate = await localPricingService.estimatePrice({
      image,
      condition: condition || "used",
      userDescription,
      ebayResults,
    });

    res.status(200).json({
      success: true,
      message: "Price estimate completed successfully",
      query,
      conditionId,
      ebayResults,
      priceEstimate,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
