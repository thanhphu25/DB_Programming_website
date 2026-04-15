const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define(
  'Customer',
  {
    customerNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    customerName: DataTypes.STRING,
    contactLastName: DataTypes.STRING,
    contactFirstName: DataTypes.STRING,
    phone: DataTypes.STRING,
    addressLine1: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    creditLimit: DataTypes.DECIMAL(10, 2)
  },
  {
    tableName: 'customers'
  }
);

module.exports = Customer;
