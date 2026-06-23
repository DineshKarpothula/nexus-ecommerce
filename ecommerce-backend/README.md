# Ecommerce Backend

Express + MongoDB Atlas + Stripe test mode backend for the ecommerce frontend.

## Setup

1. Copy `.env.example` to `.env` and fill in MongoDB Atlas and Stripe test keys.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

4. Optional: seed an admin user:

```bash
npm run seed:admin
```

## MongoDB Atlas Checklist

1. In Atlas, create a database user and note username/password.
2. In Atlas Network Access, allow your IP (or temporarily `0.0.0.0/0` for testing).
3. In Atlas Clusters, copy the Node.js connection string.
4. Put it in `.env` as `MONGODB_URI`.
5. Optional: set `MONGODB_DB=ecommerce` to force DB name.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=ecommerce
```

## Available API groups

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/admin`
- `/api/payments`

## Notes

- Stripe is configured for test mode only.
- Amounts are sent as rupees from the frontend and converted to paise in the payment controller.
- The frontend dev server proxy should continue forwarding `/api` to `http://localhost:5000`.