const express = require("express");
const router = express.Router();

const itemRepository = require("../repositories/itemRepository");
const upload = require("../middleware/multer");
const Item = require("../models/Item");

// GET all items
router.get("/", async (req, res, next) => {
  try {
    const items = await itemRepository.getAllItems();

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
    const item = await itemRepository.getItemById(req.params.id);

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

// DELETE item
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await itemRepository.deleteItemById(req.params.id);

    if (!item) {
      const error = new Error("Item not found");
      error.statusCode = 404;
      throw error;
    }

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

            const { title, description, price, category, brand, condition } = req.body;

            const newItem = new Item({

                title,
                description,
                price,
                category,
                brand,
                condition,

                imageUrl: req.file
                    ? req.file.path
                    : null
            });

            const savedItem = await newItem.save();

            res.status(201).json({
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