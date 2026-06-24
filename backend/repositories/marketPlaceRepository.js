const MarketPlace = require("../models/MarketPlace");

const createMarketPlaceListing = async (listingData) => {
  return await MarketPlace.create(listingData);
};

const createManyMarketPlaceListings = async (listings) => {
  return await MarketPlace.insertMany(listings);
};

const getAllMarketPlaceListings = async () => {
  return await MarketPlace.find().populate("item");
};

const getMarketPlaceListingById = async (id) => {
  return await MarketPlace.findById(id).populate("item");
};

const getMarketPlaceListingsByItemId = async (itemId) => {
  return await MarketPlace.find({ item: itemId }).populate("item");
};

const getMarketPlaceListingsByMarketplace = async (marketplace) => {
  return await MarketPlace.find({
    marketplace: { $regex: `^${marketplace}$`, $options: "i" },
  }).populate("item");
};

const updateMarketPlaceListingById = async (id, listingData) => {
  return await MarketPlace.findByIdAndUpdate(id, listingData, {
    new: true,
    runValidators: true,
  }).populate("item");
};

const deleteMarketPlaceListingById = async (id) => {
  return await MarketPlace.findByIdAndDelete(id);
};

const deleteMarketPlaceListingsByItemId = async (itemId) => {
  return await MarketPlace.deleteMany({ item: itemId });
};

module.exports = {
  createMarketPlaceListing,
  createManyMarketPlaceListings,
  getAllMarketPlaceListings,
  getMarketPlaceListingById,
  getMarketPlaceListingsByItemId,
  getMarketPlaceListingsByMarketplace,
  updateMarketPlaceListingById,
  deleteMarketPlaceListingById,
  deleteMarketPlaceListingsByItemId,
};