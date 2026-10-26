# Smart Product Passport & Lifecycle Tracking System

A full MERN stack web application that generates digital passports for electronic products. Features QR code generation, warranty tracking, repair history timelines, and a tamper-evident SHA-256 hash chain audit system.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **QR Codes**: `qrcode` npm package + `qrcode.react`
- **Audit Chain**: Node.js `crypto` module (SHA-256)

---

## Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas connection string

---

## Installation

### 1. Clone and enter the project
```bash
cd MERN-Capstone
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI if not using the local default
npm install
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

---

## Running the Application

Open **two terminals**:

**Terminal 1 – Backend**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 – Frontend**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## Seed Demo Data

With the backend running (or MongoDB accessible), run:
```bash
cd server
npm run seed
```

This creates **7 demo products** (MacBook Pro, iPhone, Samsung Galaxy, Dell XPS, Sony headphones, LG TV, Canon camera) with **10 realistic repair records** including proper SHA-256 hash chains.

---

## Environment Variables (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGODB_URI` | `mongodb://localhost:27017/smart-product-passport` | MongoDB connection string |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (used in QR code links) |
| `NODE_ENV` | `development` | Environment |

---

## API Endpoints

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Total products, warranty counts, recent products |

### Products
| Method | Path | Description |
|---|---|---|
| POST | `/api/products` | Register a new product |
| GET | `/api/products` | List products (search, filter, paginate) |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:id/passport` | Public passport data (product + repairs) |
| GET | `/api/products/:id/qrcode` | Get or generate QR code |

### Repairs
| Method | Path | Description |
|---|---|---|
| POST | `/api/products/:id/repairs` | Add a repair record (hash-chained) |
| GET | `/api/products/:id/repairs` | List repair records |
| GET | `/api/products/:id/repairs/verify` | Verify the audit hash chain |

---

## Features

### Digital Product Passport
Each product gets a unique QR code that links to its public passport page at `/passport/:id`. The page shows product info, warranty status, and complete service history.

### Tamper-Evident Audit Chain
Each repair record stores:
- A SHA-256 hash of its own content
- The hash of the previous record (chain link)
- A sequence number

**Important limitation**: Hash verification confirms that stored data has not been silently altered *after* being written. It does **not** independently prove that the described repairs occurred in the physical world.

### What the audit system prevents
- Silent modification of existing repair records
- Deletion of records mid-chain (the chain breaks)

### What the audit system does NOT do
- Prevent addition of fraudulent new records
- Prove physical work was done
- Replace a trusted service provider relationship

---

## Project Structure

```
MERN-Capstone/
├── server/
│   ├── src/
│   │   ├── models/          # Product.js, RepairRecord.js
│   │   ├── routes/          # products.js, repairs.js, dashboard.js
│   │   ├── utils/           # audit.js (SHA-256 hash chain)
│   │   └── index.js         # Express app entry point
│   ├── public/qrcodes/      # Generated QR code PNGs
│   ├── seed.js              # Demo data seeder
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── api/             # Axios API wrappers
    │   ├── components/      # Sidebar, Layout, ProductCard, etc.
    │   ├── pages/           # Dashboard, Products, ProductDetail, etc.
    │   └── main.jsx
    └── vite.config.js
```
