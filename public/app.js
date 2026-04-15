const resultHead = document.querySelector('#resultTable thead');
const resultBody = document.querySelector('#resultTable tbody');
const statsHead = document.querySelector('#statsTable thead');
const statsBody = document.querySelector('#statsTable tbody');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatQuestionInput = document.getElementById('chatQuestion');

let chartInstance;

function getDateQuery() {
  const params = new URLSearchParams();
  if (fromDate.value) params.append('from', fromDate.value);
  if (toDate.value) params.append('to', toDate.value);
  return params;
}

function renderTable(rows, table = 'result') {
  const head = table === 'stats' ? statsHead : resultHead;
  const body = table === 'stats' ? statsBody : resultBody;
  head.innerHTML = '';
  body.innerHTML = '';

  if (!rows || !rows.length) {
    head.innerHTML = '<tr><th>Thong bao</th></tr>';
    body.innerHTML = '<tr><td>Khong co du lieu</td></tr>';
    return;
  }

  const headers = Object.keys(rows[0]);
  const headerRow = document.createElement('tr');
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  head.appendChild(headerRow);

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    headers.forEach((header) => {
      const td = document.createElement('td');
      const value = row[header];
      td.textContent = value == null ? '' : value;
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

function setActiveTab(tabId) {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}

function addMessage(role, text) {
  const message = document.createElement('div');
  message.className = `msg ${role}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  return `${numeric.toLocaleString('vi-VN')} USD`;
}

function formatChatDataAsText(data) {
  if (!Array.isArray(data) || !data.length) {
    return '';
  }

  const lines = data.slice(0, 5).map((item, index) => {
    if (item.customerName) {
      return `${index + 1}. ${item.customerName} - ${formatCurrency(item.revenue)}`;
    }
    if (item.productName) {
      return `${index + 1}. ${item.productName} - ${formatCurrency(item.revenue)}`;
    }
    if (item.period) {
      return `${index + 1}. ${item.period} - ${formatCurrency(item.revenue)}`;
    }
    return `${index + 1}. ${JSON.stringify(item)}`;
  });

  return `\n${lines.join('\n')}`;
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
  const pivotRows = (result.data || []).map((item) => ({
    ...item,
    orderMonth: String(item.orderDate || '').slice(0, 7)
  }));

  $(function () {
    $('#pivotOutput').pivotUI(pivotRows, {
      rows: ['country', 'productLine'],
      cols: ['orderMonth'],
      vals: ['revenue'],
      aggregatorName: 'Sum'
    });
  });
}

document.getElementById('btnSearchCustomers').addEventListener('click', async () => {
  try {
    const search = document.getElementById('customerSearch').value;
    const result = await fetchJson(`/api/customers?search=${encodeURIComponent(search)}&limit=25`);
    renderTable(result.data, 'result');
    setActiveTab('searchPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'result');
  }
});

document.getElementById('btnSearchProducts').addEventListener('click', async () => {
  try {
    const search = document.getElementById('productSearch').value;
    const result = await fetchJson(`/api/products?search=${encodeURIComponent(search)}&limit=25`);
    renderTable(result.data, 'result');
    setActiveTab('searchPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'result');
  }
});

document.getElementById('btnSearchOrders').addEventListener('click', async () => {
  try {
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

    renderTable(rows, 'result');
    setActiveTab('searchPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'result');
  }
});

document.getElementById('btnCustomerStats').addEventListener('click', async () => {
  try {
    const params = getDateQuery();
    const result = await fetchJson(`/api/stats/customers?${params.toString()}&limit=10`);
    renderTable(result.data, 'stats');
    drawChart(
      result.data.map((x) => x.customerName),
      result.data.map((x) => Number(x.revenue)),
      'Revenue'
    );
    setActiveTab('statsPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'stats');
  }
});

document.getElementById('btnTimeStats').addEventListener('click', async () => {
  try {
    const params = getDateQuery();
    const groupBy = document.getElementById('timeGroupBy').value;
    params.append('groupBy', groupBy);
    const result = await fetchJson(`/api/stats/time?${params.toString()}`);
    renderTable(result.data, 'stats');
    drawChart(
      result.data.map((x) => x.period),
      result.data.map((x) => Number(x.revenue)),
      'Revenue'
    );
    setActiveTab('statsPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'stats');
  }
});

document.getElementById('btnProductStats').addEventListener('click', async () => {
  try {
    const params = getDateQuery();
    const result = await fetchJson(`/api/stats/products?${params.toString()}&limit=10`);
    renderTable(result.data, 'stats');
    drawChart(
      result.data.map((x) => x.productName),
      result.data.map((x) => Number(x.revenue)),
      'Revenue'
    );
    setActiveTab('statsPanel');
  } catch (error) {
    renderTable([{ error: error.message }], 'stats');
  }
});

document.getElementById('btnReloadPivot').addEventListener('click', async () => {
  await loadPivot();
  setActiveTab('pivotPanel');
});

document.getElementById('btnAsk').addEventListener('click', async () => {
  const question = chatQuestionInput.value.trim();
  if (!question) return;

  addMessage('user', question);
  chatQuestionInput.value = '';

  try {
    const result = await fetchJson('/api/chatbot/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    const answer = result.answer || 'Khong co tra loi.';
    const detail = formatChatDataAsText(result.data);
    addMessage('bot', `${answer}${detail}`);
  } catch (error) {
    addMessage('bot', `Loi ket noi chatbot: ${error.message}`);
  }
});

chatQuestionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('btnAsk').click();
  }
});

chatToggle.addEventListener('click', () => {
  chatWidget.classList.toggle('hidden');
  if (!chatWidget.classList.contains('hidden')) {
    chatQuestionInput.focus();
  }
});

chatClose.addEventListener('click', () => {
  chatWidget.classList.add('hidden');
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.tab);
  });
});

(async function bootstrap() {
  addMessage(
    'bot',
    'Xin chao, minh la chatbot demo. Ban co the hoi: top khach hang, top mat hang, thong ke theo thoi gian.'
  );

  try {
    await loadPivot();
    const defaultStats = await fetchJson('/api/stats/time?groupBy=month');
    renderTable(defaultStats.data, 'stats');
    drawChart(
      defaultStats.data.map((x) => x.period),
      defaultStats.data.map((x) => Number(x.revenue)),
      'Revenue'
    );
  } catch (error) {
    renderTable([{ error: error.message }], 'stats');
  }
})();
