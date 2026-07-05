const Image = require("../models/Image");

const createImage = async (imageData) => {
  return await Image.create(imageData);
};

const getAllImages = async () => {
  return await Image.find()
    .populate("item")
    .populate("uploadedBy", "-password");
};

const getImageById = async (id) => {
  return await Image.findById(id)
    .populate("item")
    .populate("uploadedBy", "-password");
};

const updateImageById = async (id, imageData) => {
  return await Image.findByIdAndUpdate(id, imageData, {
    new: true,
    runValidators: true,
  });
};

const deleteImageById = async (id) => {
  return await Image.findByIdAndDelete(id);
};

module.exports = {
  createImage,
  getAllImages,
  getImageById,
  updateImageById,
  deleteImageById,
};