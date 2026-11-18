# FarmFresh

A marketplace where farmers and local traders sell food, and anyone can buy it.

- **Visitors** can browse the catalogue without an account.
- **Buyers** (an account is needed) fill a basket, check out, follow their orders and review sellers.
- **Sellers** list food with a price, a quantity, pictures and an end time. Ended offers show as *Expired* for 24 hours, then disappear.
- **Admins** run the FarmFresh catalogue, verify sellers, remove bad listings, handle reports and process FarmFresh orders.

One account can be both a buyer and a seller.

## Built with

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT login, Zod validation, Sharp (pictures)
- **Frontend:** React (Vite), React Router, Axios, plain CSS

## What you need

- Node.js 20 or newer
- A MongoDB Atlas database (the free tier works). Orders use database transactions, which need a replica set, and Atlas provides one.

## Setup

### 1. Backend

```
cd backend
npm install
```

Create a file called `.env` in `backend` with these values:

| Name | Meaning |
|---|---|
| `PORT` | Port for the API, for example `5000` |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | Your Atlas connection string, ending with the database name, for example `.../farm_marketplace?retryWrites=true&w=majority` |
| `CLIENT_URL` | Where the website runs, for example `http://localhost:5173` (no slash at the end) |
| `JWT_ACCESS_SECRET` | A random secret of at least 32 characters |
| `JWT_REFRESH_SECRET` | A different random secret of at least 32 characters |
| `ALLOW_MOCK_PAYMENTS` | Only matters when `NODE_ENV=production`. Leave it unset so the demo payment is refused online. |

Make a secret with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start the API:

```
npm run dev
```

Check `http://localhost:5000/api/health`. It should answer `{"ok":true}`.

### 2. Create your admin account

Admins can't be created on the website. Use the script (keep the password in quotes):

```
npm run create-admin -- you@example.com "Your Name" "Str0ng!Password"
```

### 3. Fill the catalogue with sample items (optional)

```
npm run seed
```

Then log in as admin, open **Admin > Catalogue**, and add pictures and real prices.

### 4. Frontend

```
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start it with `npm run dev` and open `http://localhost:5173`.

## Useful commands (in `backend`)

| Command | What it does |
|---|---|
| `npm run dev` or `npm start` | Starts the API and restarts it when you save a file |
| `npm test` | Runs the automated tests (stock, prices, orders, login lock) against a temporary database |
| `npm run create-admin -- email "Name" "Password"` | Creates or upgrades an admin |
| `npm run seed` | Adds the sample catalogue items |
| `npm run cleanup-uploads` | Lists picture files nothing uses. Add `-- --delete` to remove them. |

## How the backend is organised

Every request travels in one direction:

```
route -> security middleware -> controller -> service -> model
```

- `routes/` connect a URL to its middleware and controller
- `middleware/` login and role checks, input validation, rate limits, uploads, errors
- `controllers/` read the request and send the answer
- `services/` the business rules and database work
- `models/` the database shapes
- `jobs/` the scheduled task that marks listings expired and archives them

## Good to know

- **Prices come from the database.** The browser only sends ids and quantities.
- **Stock is reduced inside a transaction.** If any line of an order fails, nothing changes.
- **Pictures are checked, shrunk and saved as WEBP.** Hidden data such as GPS location is removed.
- **Payments are a demo.** The Make payment button marks an order as paid and takes no money. The server refuses it when `NODE_ENV=production`.

## Fill in before you launch

- Bank details: `frontend/src/utils/constants.js` (`BANK_ACCOUNTS`)
- Contact details and social links: the same file (`CONTACT`, `SOCIAL`)
- Policy text, including the refund time limit: `frontend/src/pages/policy/Policy.jsx`. Have it reviewed by a lawyer.
- FarmFresh's delivery fee: `PLATFORM_DELIVERY_FEE` in `backend/src/services/order.service.js`

## Before going online

- Replace the demo payment with a real mobile money provider.
- Use HTTPS. If the website and the API are on different domains, the login cookie needs `SameSite=None` with `Secure`, and the server needs `app.set("trust proxy", 1)` when it sits behind a proxy.
- Set `NODE_ENV=production` and a real `CLIENT_URL`.
- In Atlas, replace "allow access from anywhere" with your server's address, and use a database user with only the rights it needs.
- Run `npm audit` in both folders.
- Add notifications (order emails or SMS).
