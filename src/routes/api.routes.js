const express = require('express');
const searchController = require('../controllers/search.controller');
const statsController = require('../controllers/stats.controller');
const chatbotController = require('../controllers/chatbot.controller');

const router = express.Router();

router.get('/health', (_, res) => {
  res.json({ ok: true, message: 'Classicmodels API is running' });
});

router.get('/customers', searchController.getCustomers);
router.get('/products', searchController.getProducts);
router.get('/orders', searchController.getOrders);

router.get('/stats/customers', statsController.customerStats);
router.get('/stats/time', statsController.timeStats);
router.get('/stats/products', statsController.productStats);
router.get('/stats/pivot-data', statsController.pivotData);

router.post('/chatbot/ask', express.json(), chatbotController.ask);

module.exports = router;
