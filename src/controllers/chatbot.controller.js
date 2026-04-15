const { getCustomerStats, getProductStats, getTimeStats } = require('../services/stats.service');

function lower(value = '') {
  return String(value).toLowerCase().trim();
}

async function ask(req, res, next) {
  try {
    const question = lower(req.body.question);
    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    if (question.includes('khach hang') || question.includes('customer')) {
      const top = await getCustomerStats({ limit: 5 });
      return res.json({
        answer: 'Top 5 khach hang co doanh thu cao nhat:',
        data: top
      });
    }

    if (question.includes('mat hang') || question.includes('san pham') || question.includes('product')) {
      const top = await getProductStats({ limit: 5 });
      return res.json({
        answer: 'Top 5 mat hang co doanh thu cao nhat:',
        data: top
      });
    }

    if (question.includes('thoi gian') || question.includes('month') || question.includes('quy')) {
      const byTime = await getTimeStats({ groupBy: 'month' });
      return res.json({
        answer: 'Thong ke doanh thu theo thang:',
        data: byTime
      });
    }

    return res.json({
      answer: 'Ban co the hoi: top khach hang, top mat hang, thong ke theo thoi gian.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ask
};
