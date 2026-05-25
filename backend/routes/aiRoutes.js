const express = require("express");
const OpenAI = require("openai");
const router = express.Router();

const imageRepository = require("../repositories/imageRepository");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this resale item image. Return likely category, brand if visible, condition estimate, material/style clues, and useful pricing notes. Keep it short.",
            },
            {
              type: "input_image",
              image_url: image.imageUrl,
            },
          ],
        },
      ],
    });

    const aiDescription = response.output_text;

    const updatedImage = await imageRepository.updateImageById(imageId, {
      aiDescription,
    });

    res.status(200).json({
      success: true,
      message: "AI image processing completed successfully",
      image: updatedImage,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;