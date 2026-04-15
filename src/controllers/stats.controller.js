const {
  getCustomerStats,
  getTimeStats,
  getProductStats,
  getPivotRows
} = require('../services/stats.service');

async function customerStats(req, res, next) {
  try {
    const { from, to, limit } = req.query;
    const data = await getCustomerStats({ from, to, limit });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

async function timeStats(req, res, next) {
  try {
    const { from, to, groupBy } = req.query;
    const data = await getTimeStats({ from, to, groupBy });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

async function productStats(req, res, next) {
  try {
    const { from, to, limit } = req.query;
    const data = await getProductStats({ from, to, limit });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

async function pivotData(req, res, next) {
  try {
    const { from, to, limit } = req.query;
    const data = await getPivotRows({ from, to, limit });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  customerStats,
  timeStats,
  productStats,
  pivotData
};
