const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const vision = require("@google-cloud/vision");
const router = express.Router();

const imageRepository = require("../repositories/imageRepository");

const visionClient = new vision.ImageAnnotatorClient();

const isRemoteUrl = (imageUrl) => /^https?:\/\//i.test(imageUrl);

const buildVisionImage = async (imageUrl) => {
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

    const visionImage = await buildVisionImage(image.imageUrl);

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

    const updatedImage = await imageRepository.updateImageById(imageId, {
      aiTags,
      aiDescription,
    });

    res.status(200).json({
      success: true,
      message: "Google Vision image processing completed successfully",
      image: updatedImage,
      vision: {
        labels,
        logos,
        objects,
        text,
      },
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
