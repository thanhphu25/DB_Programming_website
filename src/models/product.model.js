const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    productCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    productName: DataTypes.STRING,
    productLine: DataTypes.STRING,
    productVendor: DataTypes.STRING,
    buyPrice: DataTypes.DECIMAL(10, 2),
    MSRP: DataTypes.DECIMAL(10, 2)
  },
  {
    tableName: 'products'
  }
);

module.exports = Product;
