const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    orderNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    orderDate: DataTypes.DATEONLY,
    requiredDate: DataTypes.DATEONLY,
    shippedDate: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    comments: DataTypes.TEXT,
    customerNumber: DataTypes.INTEGER
  },
  {
    tableName: 'orders'
  }
);

module.exports = Order;
