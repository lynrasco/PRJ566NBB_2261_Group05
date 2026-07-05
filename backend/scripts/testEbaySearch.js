require('dotenv').config();
const connectDB = require('../config/db');
const Image = require('../models/Image');
const ebayService = require('../services/ebayService');
const aiRoutes = require('../routes/aiRoutes');

(async () => {
  try {
    await connectDB();
    const image = await Image.findOne().lean();
    if (!image) {
      console.log('NO_IMAGE_FOUND');
      return;
    }
    // Use the backend's query builder for consistent behavior
    const query = aiRoutes.buildEbaySearchQuery({ image, userDescription: '' });
    console.log('SEARCH_QUERY', query);
    const result = await ebayService.searchItems(query, 3000, 3);
    console.log('EBAY_RESULT_SUMMARY', JSON.stringify(result, null, 2).slice(0, 1000));
  } catch (err) {
    console.error('ERROR', err.message || err);
  } finally {
    process.exit();
  }
})();
