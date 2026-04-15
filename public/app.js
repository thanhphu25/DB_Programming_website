const resultHead = document.querySelector('#resultTable thead');
const resultBody = document.querySelector('#resultTable tbody');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');

let chartInstance;

function getDateQuery() {
  const params = new URLSearchParams();
  if (fromDate.value) params.append('from', fromDate.value);
  if (toDate.value) params.append('to', toDate.value);
  return params;
}

function renderTable(rows) {
  resultHead.innerHTML = '';
  resultBody.innerHTML = '';

  if (!rows || !rows.length) {
    resultHead.innerHTML = '<tr><th>Thong bao</th></tr>';
    resultBody.innerHTML = '<tr><td>Khong co du lieu</td></tr>';
    return;
  }

  const headers = Object.keys(rows[0]);
  const headerRow = document.createElement('tr');
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  resultHead.appendChild(headerRow);

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    headers.forEach((header) => {
      const td = document.createElement('td');
      const value = row[header];
      td.textContent = value == null ? '' : value;
      tr.appendChild(td);
    });
    resultBody.appendChild(tr);
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function drawChart(labels, data, datasetLabel) {
  const ctx = document.getElementById('statsChart');
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data,
          backgroundColor: '#0f9d58'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

async function loadPivot() {
  const params = getDateQuery();
  params.append('limit', '4000');
  const result = await fetchJson(`/api/stats/pivot-data?${params.toString()}`);

  $(function () {
    $('#pivotOutput').pivotUI(result.data, {
      rows: ['country', 'productLine'],
      cols: ['orderDate'],
      vals: ['revenue'],
      aggregatorName: 'Sum'
    });
  });
}

document.getElementById('btnSearchCustomers').addEventListener('click', async () => {
  const search = document.getElementById('customerSearch').value;
  const result = await fetchJson(`/api/customers?search=${encodeURIComponent(search)}&limit=25`);
  renderTable(result.data);
});

document.getElementById('btnSearchProducts').addEventListener('click', async () => {
  const search = document.getElementById('productSearch').value;
  const result = await fetchJson(`/api/products?search=${encodeURIComponent(search)}&limit=25`);
  renderTable(result.data);
});

document.getElementById('btnSearchOrders').addEventListener('click', async () => {
  const params = getDateQuery();
  params.append('limit', '20');
  const result = await fetchJson(`/api/orders?${params.toString()}`);

  const rows = result.data.map((order) => ({
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    customerName: order.Customer ? order.Customer.customerName : '',
    status: order.status,
    itemCount: order.OrderDetails ? order.OrderDetails.length : 0
  }));

  renderTable(rows);
});

document.getElementById('btnCustomerStats').addEventListener('click', async () => {
  const params = getDateQuery();
  const result = await fetchJson(`/api/stats/customers?${params.toString()}&limit=10`);
  renderTable(result.data);
  drawChart(
    result.data.map((x) => x.customerName),
    result.data.map((x) => Number(x.revenue)),
    'Revenue'
  );
});

document.getElementById('btnTimeStats').addEventListener('click', async () => {
  const params = getDateQuery();
  const groupBy = document.getElementById('timeGroupBy').value;
  params.append('groupBy', groupBy);
  const result = await fetchJson(`/api/stats/time?${params.toString()}`);
  renderTable(result.data);
  drawChart(
    result.data.map((x) => x.period),
    result.data.map((x) => Number(x.revenue)),
    'Revenue'
  );
});

document.getElementById('btnProductStats').addEventListener('click', async () => {
  const params = getDateQuery();
  const result = await fetchJson(`/api/stats/products?${params.toString()}&limit=10`);
  renderTable(result.data);
  drawChart(
    result.data.map((x) => x.productName),
    result.data.map((x) => Number(x.revenue)),
    'Revenue'
  );
});

document.getElementById('btnAsk').addEventListener('click', async () => {
  const question = document.getElementById('chatQuestion').value;
  const result = await fetchJson('/api/chatbot/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  document.getElementById('chatAnswer').textContent = JSON.stringify(result, null, 2);
});

(async function bootstrap() {
  await loadPivot();
  const defaultStats = await fetchJson('/api/stats/time?groupBy=month');
  renderTable(defaultStats.data);
  drawChart(
    defaultStats.data.map((x) => x.period),
    defaultStats.data.map((x) => Number(x.revenue)),
    'Revenue'
  );
})();
