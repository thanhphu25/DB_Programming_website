const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

function buildDateCondition(from, to, alias = 'o') {
  const conditions = [];
  const replacements = {};

  if (from) {
    conditions.push(`${alias}.orderDate >= :from`);
    replacements.from = from;
  }
  if (to) {
    conditions.push(`${alias}.orderDate <= :to`);
    replacements.to = to;
  }

  return {
    whereSql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    replacements
  };
}

async function getCustomerStats({ from, to, limit = 10 }) {
  const { whereSql, replacements } = buildDateCondition(from, to);
  replacements.limit = Number(limit);

  return sequelize.query(
    `
    SELECT
      c.customerNumber,
      c.customerName,
      c.country,
      COUNT(DISTINCT o.orderNumber) AS totalOrders,
      SUM(od.quantityOrdered * od.priceEach) AS revenue
    FROM customers c
    JOIN orders o ON o.customerNumber = c.customerNumber
    JOIN orderdetails od ON od.orderNumber = o.orderNumber
    ${whereSql}
    GROUP BY c.customerNumber, c.customerName, c.country
    ORDER BY revenue DESC
    LIMIT :limit
  `,
    { replacements, type: QueryTypes.SELECT }
  );
}

async function getTimeStats({ from, to, groupBy = 'month' }) {
  const { whereSql, replacements } = buildDateCondition(from, to);
  let periodExpression = "DATE_FORMAT(o.orderDate, '%Y-%m')";

  if (groupBy === 'year') {
    periodExpression = 'YEAR(o.orderDate)';
  }
  if (groupBy === 'quarter') {
    periodExpression = "CONCAT(YEAR(o.orderDate), '-Q', QUARTER(o.orderDate))";
  }

  return sequelize.query(
    `
    SELECT
      ${periodExpression} AS period,
      COUNT(DISTINCT o.orderNumber) AS totalOrders,
      SUM(od.quantityOrdered * od.priceEach) AS revenue
    FROM orders o
    JOIN orderdetails od ON od.orderNumber = o.orderNumber
    ${whereSql}
    GROUP BY period
    ORDER BY period ASC
  `,
    { replacements, type: QueryTypes.SELECT }
  );
}

async function getProductStats({ from, to, limit = 15 }) {
  const { whereSql, replacements } = buildDateCondition(from, to);
  replacements.limit = Number(limit);

  return sequelize.query(
    `
    SELECT
      p.productCode,
      p.productName,
      p.productLine,
      SUM(od.quantityOrdered) AS totalQty,
      SUM(od.quantityOrdered * od.priceEach) AS revenue
    FROM products p
    JOIN orderdetails od ON od.productCode = p.productCode
    JOIN orders o ON o.orderNumber = od.orderNumber
    ${whereSql}
    GROUP BY p.productCode, p.productName, p.productLine
    ORDER BY revenue DESC
    LIMIT :limit
  `,
    { replacements, type: QueryTypes.SELECT }
  );
}

async function getPivotRows({ from, to, limit = 5000 }) {
  const { whereSql, replacements } = buildDateCondition(from, to);
  replacements.limit = Number(limit);

  return sequelize.query(
    `
    SELECT
      o.orderDate,
      c.customerName,
      c.country,
      p.productLine,
      p.productName,
      od.quantityOrdered,
      od.priceEach,
      od.quantityOrdered * od.priceEach AS revenue
    FROM orders o
    JOIN customers c ON c.customerNumber = o.customerNumber
    JOIN orderdetails od ON od.orderNumber = o.orderNumber
    JOIN products p ON p.productCode = od.productCode
    ${whereSql}
    ORDER BY o.orderDate DESC
    LIMIT :limit
  `,
    { replacements, type: QueryTypes.SELECT }
  );
}

module.exports = {
  getCustomerStats,
  getTimeStats,
  getProductStats,
  getPivotRows
};
