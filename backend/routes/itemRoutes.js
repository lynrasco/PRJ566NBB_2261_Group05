const express = require("express");
const router = express.Router();

const itemRepository = require("../repositories/itemRepository");
const upload = require("../middleware/multer");
const protect = require("../middleware/authMiddleware");
const Item = require("../models/Item");
const PriceSuggestion = require("../models/PriceSuggestion");

const {
  getOrCreateDailySnapshot,
} = require("../services/dailyAnalyticsSnapshotService");

router.use(protect);

// GET authenticated user's items
router.get("/", async (req, res, next) => {
  try {
    const items = await itemRepository.getItemsByUserId(
      req.user._id
    );

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    next(error);
  }
});

// GET item by ID
router.get("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

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

// UPDATE item
router.put("/:id", async (req, res, next) => {
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

    await getOrCreateDailySnapshot(req.user._id);

    const updatedItem = await Item.findOneAndUpdate(
  {
    _id: req.params.id,
    owner: req.user._id,
  },
  updates,
  {
    new: true,
    runValidators: true,
  }
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
        }
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
        }
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

// DELETE item
router.delete("/:id", async (req, res, next) => {
  try {
    // Save today's opening total before deleting anything
    await getOrCreateDailySnapshot(req.user._id);

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

    await PriceSuggestion.deleteMany({
      item: item._id,
    });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.post(
    '/upload',
    upload.single('image'),
    async (req, res) => {

        try {

            const { title, description, price, category, categoryId, brand, condition, imageUrl } = req.body;

            await getOrCreateDailySnapshot(req.user._id);

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
                    //? req.file.path
                    ? `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`
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
                }
              );
            }

            res.status(201).json({
                success: true,
                message: 'Item created successfully',
                item: savedItem
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: 'Server error'
            });
        }
    }
);

module.exports = router;