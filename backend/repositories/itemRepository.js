const Item = require("../models/Item");

const createItem = async (itemData) => {
  return await Item.create(itemData);
};

const getAllItems = async () => {
  return await Item.find();
};

const getItemById = async (id) => {
  return await Item.findById(id);
};

const updateItemById = async (id, itemData) => {
  return await Item.findByIdAndUpdate(id, itemData, {
    new: true,
    runValidators: true,
  });
};

const deleteItemById = async (id) => {
  return await Item.findByIdAndDelete(id);
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItemById,
  deleteItemById,
};
