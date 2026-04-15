const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderDetail = sequelize.define(
  'OrderDetail',
  {
    orderNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    productCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    quantityOrdered: DataTypes.INTEGER,
    priceEach: DataTypes.DECIMAL(10, 2),
    orderLineNumber: DataTypes.SMALLINT
  },
  {
    tableName: 'orderdetails'
  }
);

module.exports = OrderDetail;
