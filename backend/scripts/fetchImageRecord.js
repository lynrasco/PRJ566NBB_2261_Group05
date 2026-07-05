require('dotenv').config();
const connectDB = require('../config/db');
const Image = require('../models/Image');

(async () => {
  try {
    await connectDB();
    const image = await Image.findOne().lean();
    if (!image) {
      console.log('NO_IMAGE_FOUND');
      return;
    }
    console.log('FOUND_IMAGE');
    console.log(JSON.stringify(image, null, 2));
  } catch (error) {
    console.error('ERROR', error.message || error);
  } finally {
    process.exit();
  }
})();
