const { Op } = require('sequelize');
const { Customer, Order, OrderDetail, Product } = require('../models');

function parsePagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

async function getCustomers(req, res, next) {
  try {
    const { search = '', country } = req.query;
    const { limit, offset, page } = parsePagination(req.query);

    const where = {};
    if (search) {
      where[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { contactFirstName: { [Op.like]: `%${search}%` } },
        { contactLastName: { [Op.like]: `%${search}%` } }
      ];
    }
    if (country) {
      where.country = country;
    }

    const { rows, count } = await Customer.findAndCountAll({
      where,
      limit,
      offset,
      order: [['customerName', 'ASC']]
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const { search = '', productLine } = req.query;
    const { limit, offset, page } = parsePagination(req.query);

    const where = {};
    if (search) {
      where[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { productVendor: { [Op.like]: `%${search}%` } },
        { productCode: { [Op.like]: `%${search}%` } }
      ];
    }
    if (productLine) {
      where.productLine = productLine;
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['productName', 'ASC']]
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const { from, to, customerNumber, productCode } = req.query;
    const { limit, offset, page } = parsePagination(req.query);

    const orderWhere = {};
    if (from || to) {
      orderWhere.orderDate = {};
      if (from) orderWhere.orderDate[Op.gte] = from;
      if (to) orderWhere.orderDate[Op.lte] = to;
    }
    if (customerNumber) {
      orderWhere.customerNumber = Number(customerNumber);
    }

    const detailWhere = {};
    if (productCode) {
      detailWhere.productCode = productCode;
    }

    const { rows, count } = await Order.findAndCountAll({
      where: orderWhere,
      include: [
        {
          model: Customer,
          attributes: ['customerNumber', 'customerName', 'country']
        },
        {
          model: OrderDetail,
          where: Object.keys(detailWhere).length ? detailWhere : undefined,
          required: Boolean(productCode),
          include: [{
            model: Product,
            attributes: ['productCode', 'productName', 'productLine']
          }]
        }
      ],
      order: [['orderDate', 'DESC']],
      distinct: true,
      limit,
      offset
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomers,
  getProducts,
  getOrders
};
