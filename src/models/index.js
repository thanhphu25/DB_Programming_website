const sequelize = require('../config/database');
const Customer = require('./customer.model');
const Order = require('./order.model');
const OrderDetail = require('./orderDetail.model');
const Product = require('./product.model');

Customer.hasMany(Order, { foreignKey: 'customerNumber' });
Order.belongsTo(Customer, { foreignKey: 'customerNumber' });

Order.hasMany(OrderDetail, { foreignKey: 'orderNumber' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderNumber' });

Product.hasMany(OrderDetail, { foreignKey: 'productCode' });
OrderDetail.belongsTo(Product, { foreignKey: 'productCode' });

module.exports = {
  sequelize,
  Customer,
  Order,
  OrderDetail,
  Product
};
