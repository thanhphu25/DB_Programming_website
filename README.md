# Classicmodels Analytics Website

Website demo cho mon Lap trinh voi CSDL:

- Tim kiem du lieu khach hang, don hang, mat hang
- RESTful API su dung Express
- ORM su dung Sequelize ket noi MySQL CSDL Classicmodels
- Thong ke theo:
  - Khach hang
  - Thoi gian (thang/quy/nam)
  - Mat hang
- Pivot Table (keo tha tuong tac)
- Chart (Chart.js)
- Chatbot hoi dap don gian (rule-based)

## 1. Cai dat

Yeu cau:

- Node.js >= 18
- MySQL co CSDL `classicmodels`

### Buoc 1: Cai dependencies

```bash
npm install
```

### Buoc 2: Cau hinh bien moi truong

```bash
copy .env.example .env
```

Cap nhat `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classicmodels
```

### Buoc 3: Chay app

```bash
npm run dev
```

Mo trinh duyet:

- http://localhost:3000

## 2. API chinh

- `GET /api/health`
- `GET /api/customers?search=&country=&page=&limit=`
- `GET /api/products?search=&productLine=&page=&limit=`
- `GET /api/orders?from=&to=&customerNumber=&productCode=&page=&limit=`
- `GET /api/stats/customers?from=&to=&limit=`
- `GET /api/stats/time?from=&to=&groupBy=month|quarter|year`
- `GET /api/stats/products?from=&to=&limit=`
- `GET /api/stats/pivot-data?from=&to=&limit=`
- `POST /api/chatbot/ask`

Body chatbot:

```json
{
  "question": "top khach hang"
}
```

## 3. Huong dan demo

1. Tim khach hang theo ten trong o tim kiem.
2. Tim mat hang theo ten.
3. Loc don hang theo khoang thoi gian.
4. Bam `Top khach hang`, `Theo thoi gian`, `Top mat hang` de xem thong ke + chart.
5. Khu vuc Pivot: keo tha cac truong de tao bang tong hop theo nhu cau.
6. Thu chatbot voi cau hoi:
   - `top khach hang`
   - `top mat hang`
   - `thong ke theo thoi gian`

## 4. Day len GitHub

```bash
git init
git add .
git commit -m "feat: classicmodels analytics website with ORM and REST API"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 5. Cau truc thu muc

```text
public/
  index.html
  styles.css
  app.js
src/
  config/database.js
  controllers/
  models/
  routes/api.routes.js
  services/stats.service.js
  server.js
```
