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

const getItemsByOwner = async (ownerId) => {
  return await Item.find({ owner: ownerId });
};

const getItemById = async (id) => {
  return Item.findById(id);
};

const getItemByIdAndOwner = async (id, ownerId) => {
  return await Item.findOne({ _id: id, owner: ownerId });
};

const updateItemByIdAndOwner = async (id, ownerId, itemData) => {
  return await Item.findOneAndUpdate({ _id: id, owner: ownerId }, itemData, {
    returnDocument: "after",
    runValidators: true,
  });
};

const deleteItemByIdAndOwner = async (id, ownerId) => {
  return await Item.findOneAndDelete({ _id: id, owner: ownerId });
};

module.exports = {
  createItem,
  getAllItems,
  getItemsByOwner,
  getItemById,
  getItemByIdAndOwner,
  updateItemByIdAndOwner,
  deleteItemByIdAndOwner,
};
