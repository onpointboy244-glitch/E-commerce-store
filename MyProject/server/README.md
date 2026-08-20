# 🔒 Asem Store — Secure Server

This is the **secure backend server** for your food & sweets shop. It ensures that **order totals are calculated server-side**, so no user can manipulate prices.

## How It Security Works

```
❌ BEFORE (Vulnerable):
Frontend → calculates total → sends total to Firestore
         ↑ User can hack this with browser DevTools!

✅ AFTER (Secure) — This Server:
Frontend → sends item IDs → Server looks up real prices in DB
                                   → Server calculates total
                                   → Server saves to Firestore
```

## Setup

### 1. Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project **asemstore99**
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Rename it to `serviceAccountKey.json`
7. Place it in this server folder: `server/serviceAccountKey.json`

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Run the Server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Get all products from DB |
| GET | `/api/products/:id` | Get single product by ID |
| POST | `/api/orders/calculate` | Calculate order total (server-side) |
| POST | `/api/orders` | Place a new order (server-verified) |

## Free Hosting Options

| Platform | Free Tier |
|----------|-----------|
| [Railway](https://railway.app) | $5/month credit |
| [Render](https://render.com) | Free (spins down after 15min) |
| [Fly.io](https://fly.io) | Generous free tier |
