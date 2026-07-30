const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const itemRepository = require("../repositories/itemRepository");
const upload = require("../middleware/multer");
const Item = require("../models/Item");

const PriceSuggestion = require("../models/PriceSuggestion");

// GET all items for logged-in user
router.get("/", protect, async (req, res, next) => {
  try {
    const items = await itemRepository.getItemsByOwner(req.user._id);

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    next(error);
  }
});

// GET item by ID for logged-in user
router.get("/:id", protect, async (req, res, next) => {
  try {
    const item = await itemRepository.getItemByIdAndOwner(
      req.params.id,
      req.user._id,
    );

    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE item for logged-in user
router.put("/:id", protect, async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category,
      categoryId,
      brand,
      condition,
      imageUrl,
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (brand !== undefined) updates.brand = brand;
    if (condition !== undefined) updates.condition = condition;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const updatedItem = await itemRepository.updateItemByIdAndOwner(
      req.params.id,
      req.user._id,
      updates,
    );

    if (!updatedItem) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    // Update the saved price suggestion only when the price changes
    if (price !== undefined && price !== null && price !== "") {
      const suggestedPrice = Number(updatedItem.price);

      if (!Number.isFinite(suggestedPrice) || suggestedPrice < 0) {
        const error = new Error("Price must be a valid non-negative number");
        error.statusCode = 400;
        throw error;
      }

      await PriceSuggestion.findOneAndUpdate(
        { item: updatedItem._id },
        {
          item: updatedItem._id,
          lowPrice: suggestedPrice,
          highPrice: suggestedPrice,
          suggestedPrice,
          currency: "USD",
          condition: updatedItem.condition || "used",
          reasoning: "Suggested price updated with item",
          comparablesCount: 0,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
    } else if (condition !== undefined) {
      // Keep the saved suggestion's condition synchronized
      await PriceSuggestion.findOneAndUpdate(
        { item: updatedItem._id },
        {
          condition: updatedItem.condition,
        },
        {
          new: true,
        },
      );
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE item for logged-in user
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const item = await itemRepository.deleteItemByIdAndOwner(
      req.params.id,
      req.user._id,
    );

    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    await PriceSuggestion.deleteMany({
      item: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", protect, upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      categoryId,
      brand,
      condition,
      imageUrl,
    } = req.body;

    const newItem = new Item({
      title,
      description,
      price,
      category,
      categoryId,
      brand,
      condition,
      owner: req.user._id,

      imageUrl: req.file
        ? //? req.file.path
          `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`
        : imageUrl || null,
    });

    const savedItem = await newItem.save();

    const suggestedPrice = Number(savedItem.price);

    if (Number.isFinite(suggestedPrice) && suggestedPrice >= 0) {
      await PriceSuggestion.findOneAndUpdate(
        { item: savedItem._id },
        {
          item: savedItem._id,
          lowPrice: suggestedPrice,
          highPrice: suggestedPrice,
          suggestedPrice,
          currency: "USD",
          condition: savedItem.condition,
          reasoning: "Suggested price saved with item",
          comparablesCount: 0,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: savedItem,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
