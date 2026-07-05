const PriceSuggestion = require("../models/PriceSuggestion");

const createPriceSuggestion = async (suggestionData) => {
  return await PriceSuggestion.create(suggestionData);
};

const getAllPriceSuggestions = async () => {
  return await PriceSuggestion.find().populate("item");
};

const getPriceSuggestionById = async (id) => {
  return await PriceSuggestion.findById(id).populate("item");
};

const getPriceSuggestionsByItemId = async (itemId) => {
  return await PriceSuggestion.find({ item: itemId })
    .populate("item")
    .sort({ createdAt: -1 });
};

const getLatestPriceSuggestionByItemId = async (itemId) => {
  return await PriceSuggestion.findOne({ item: itemId })
    .populate("item")
    .sort({ createdAt: -1 });
};

const updatePriceSuggestionById = async (id, suggestionData) => {
  return await PriceSuggestion.findByIdAndUpdate(id, suggestionData, {
    new: true,
    runValidators: true,
  }).populate("item");
};

const deletePriceSuggestionById = async (id) => {
  return await PriceSuggestion.findByIdAndDelete(id);
};

const deletePriceSuggestionsByItemId = async (itemId) => {
  return await PriceSuggestion.deleteMany({ item: itemId });
};

module.exports = {
  createPriceSuggestion,
  getAllPriceSuggestions,
  getPriceSuggestionById,
  getPriceSuggestionsByItemId,
  getLatestPriceSuggestionByItemId,
  updatePriceSuggestionById,
  deletePriceSuggestionById,
  deletePriceSuggestionsByItemId,
};