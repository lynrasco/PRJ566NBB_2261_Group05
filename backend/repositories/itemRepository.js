const Item = require("../models/Item");

const createItem = async (itemData) => {
  return Item.create(itemData);
};

const getAllItems = async () => {
  return Item.find();
};

const getItemsByUserId = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return Item.find({ owner: userId })
    .sort({ uploadDate: -1 }).lean();
};

const getItemById = async (id) => {
  return Item.findById(id);
};

const updateItemById = async (id, itemData) => {
  return Item.findByIdAndUpdate(id, itemData, {
    new: true,
    runValidators: true,
  });
};

const deleteItemById = async (id) => {
  return Item.findByIdAndDelete(id);
};

module.exports = {
  createItem,
  getAllItems,
  getItemsByUserId,
  getItemById,
  updateItemById,
  deleteItemById,
};