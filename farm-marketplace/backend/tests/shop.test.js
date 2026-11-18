import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// Settings the app needs. They are set BEFORE the app is imported.
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "a".repeat(40);
process.env.JWT_REFRESH_SECRET = "b".repeat(40);

let replSet, app, Listing, CatalogItem, Order;
const PASSWORD = "Str0ng!Pass";
const auth = (token) => ({ Authorization: `Bearer ${token}` });

before(
  async () => {
    // Orders use database transactions, which need a replica set
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replSet.getUri());
    app = (await import("../src/app.js")).default;
    Listing = (await import("../src/models/Listing.js")).default;
    CatalogItem = (await import("../src/models/CatalogItem.js")).default;
    Order = (await import("../src/models/Order.js")).default;
  },
  { timeout: 300_000 } // the first run downloads a test database, which takes a while
);

after(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

// ---------- helpers ----------

let counter = 0;
async function signup(type = "buyer") {
  counter++;
  const body = {
    name: `Tester ${"abcdefghijklmnopqrstuvwxyz"[counter % 26]}`,
    email: `tester${counter}@test.com`,
    password: PASSWORD,
    accountType: type,
  };
  if (type === "seller") Object.assign(body, { shopName: `Farm ${counter}`, region: "Centre" });
  const res = await request(app).post("/api/auth/register").send(body);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { token: res.body.accessToken, id: res.body.user.id, email: body.email };
}

async function createListing(seller, overrides = {}) {
  const res = await request(app)
    .post("/api/listings")
    .set(auth(seller.token))
    .send({
      title: "Fresh cassava",
      category: "tubers",
      price: 500,
      unit: "kg",
      quantityAvailable: 10,
      location: { region: "West", town: "Bafoussam" },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ...overrides,
    });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.listing;
}

const checkout = (buyer, items) =>
  request(app)
    .post("/api/orders")
    .set(auth(buyer.token))
    .send({
      items,
      fulfilment: "pickup",
      contact: { name: "Test Buyer", phone: "677123456" },
      payment: { method: "momo_mtn", phone: "677123456" },
    });

const stockOf = async (listing) => (await Listing.findById(listing._id)).quantityAvailable;

// ---------- tests ----------

test("an order uses the database price and lowers the stock", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const listing = await createListing(seller);

  // The browser tries to send its own price. It must be ignored.
  const res = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 3, price: 1 }]);

  assert.equal(res.status, 201);
  assert.equal(res.body.orders.length, 1);
  assert.equal(res.body.orders[0].total, 1500);
  assert.equal(await stockOf(listing), 7);
});

test("more than the stock is refused and the stock stays the same", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const listing = await createListing(seller);

  const res = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 11 }]);

  assert.equal(res.status, 409);
  assert.equal(await stockOf(listing), 10);
});

test("a seller cannot buy their own listing", async () => {
  const seller = await signup("seller");
  const listing = await createListing(seller);

  const res = await checkout(seller, [{ source: "listing", itemId: listing._id, quantity: 1 }]);

  assert.equal(res.status, 400);
  assert.equal(await stockOf(listing), 10);
});

test("an expired listing cannot be ordered", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const listing = await createListing(seller);
  await Listing.updateOne({ _id: listing._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });

  const res = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 1 }]);

  assert.equal(res.status, 409);
});

test("catalogue items use the catalogue price and make a FarmFresh order", async () => {
  const buyer = await signup();
  const item = await CatalogItem.create({
    name: "Pork meat",
    category: "meat_fish",
    variants: [{ label: "1 kg", price: 3500 }],
  });

  const res = await checkout(buyer, [
    { source: "catalog", itemId: String(item._id), variantId: String(item.variants[0]._id), quantity: 2, price: 1 },
  ]);

  assert.equal(res.status, 201);
  assert.equal(res.body.orders[0].soldBy, "platform");
  assert.equal(res.body.orders[0].total, 7000);
});

test("when one line fails, the whole checkout is cancelled", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const plenty = await createListing(seller, { title: "Plenty", quantityAvailable: 10 });
  const scarce = await createListing(seller, { title: "Scarce", quantityAvailable: 2 });

  const res = await checkout(buyer, [
    { source: "listing", itemId: plenty._id, quantity: 4 },
    { source: "listing", itemId: scarce._id, quantity: 5 }, // too many
  ]);

  assert.equal(res.status, 409);
  assert.equal(await stockOf(plenty), 10, "the first line must be rolled back");
  assert.equal(await Order.countDocuments({ buyer: buyer.id }), 0);
});

test("cancelling a pending order puts the stock back", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const listing = await createListing(seller);

  const placed = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 4 }]);
  assert.equal(await stockOf(listing), 6);

  const cancelled = await request(app)
    .post(`/api/orders/${placed.body.orders[0]._id}/cancel`)
    .set(auth(buyer.token));

  assert.equal(cancelled.status, 200);
  assert.equal(await stockOf(listing), 10);
});

test("only the buyer can read or pay an order, and only once", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const stranger = await signup();
  const listing = await createListing(seller);
  const placed = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 1 }]);
  const orderId = placed.body.orders[0]._id;

  const read = await request(app).get(`/api/orders/${orderId}`).set(auth(stranger.token));
  assert.equal(read.status, 403);

  const strangerPays = await request(app).post(`/api/orders/${orderId}/pay`).set(auth(stranger.token));
  assert.equal(strangerPays.status, 403);

  const paid = await request(app).post(`/api/orders/${orderId}/pay`).set(auth(buyer.token));
  assert.equal(paid.status, 200);
  assert.equal(paid.body.order.paymentStatus, "paid");

  const again = await request(app).post(`/api/orders/${orderId}/pay`).set(auth(buyer.token));
  assert.equal(again.status, 400);
});

test("weak passwords and the admin account type are refused", async () => {
  const weak = await request(app)
    .post("/api/auth/register")
    .send({ name: "Weak One", email: "weak@test.com", password: "password" });
  assert.equal(weak.status, 400);

  const admin = await request(app)
    .post("/api/auth/register")
    .send({ name: "Sneaky One", email: "sneaky@test.com", password: PASSWORD, accountType: "admin" });
  assert.equal(admin.status, 400);
});

test("five wrong passwords lock the account for a while", async () => {
  const user = await signup();

  for (let i = 0; i < 5; i++) {
    const wrong = await request(app).post("/api/auth/login").send({ email: user.email, password: "Wrong!Pass1" });
    assert.equal(wrong.status, 401);
  }

  const right = await request(app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
  assert.equal(right.status, 429);
});

test("only the buyer can confirm collection, after the seller has packed the order", async () => {
  const seller = await signup("seller");
  const buyer = await signup();
  const stranger = await signup();
  const listing = await createListing(seller);
  const placed = await checkout(buyer, [{ source: "listing", itemId: listing._id, quantity: 1 }]);
  const id = placed.body.orders[0]._id;

  const setStatus = (status) =>
    request(app).patch(`/api/orders/${id}/status`).set(auth(seller.token)).send({ status });
  const received = (token) => request(app).post(`/api/orders/${id}/received`).set(auth(token));

  assert.equal((await received(buyer.token)).status, 400, "too early");
  assert.equal((await setStatus("confirmed")).status, 200);
  assert.equal((await setStatus("packed")).status, 200);
  assert.equal((await setStatus("delivered")).status, 400, "the seller cannot mark it collected");
  assert.equal((await received(stranger.token)).status, 403, "a stranger cannot");

  const done = await received(buyer.token);
  assert.equal(done.status, 200);
  assert.equal(done.body.order.status, "delivered");
});