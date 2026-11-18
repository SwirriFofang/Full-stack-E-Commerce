import "dotenv/config";
import mongoose from "mongoose";
import CatalogItem from "../src/models/CatalogItem.js";

// [name, category, [[size label, price], ...]]
const SAMPLE = [
  ["Pork meat", "meat_fish", [["1 kg", 3500], ["500 g", 1800]]],
  ["Cow meat", "meat_fish", [["1 kg", 4000], ["500 g", 2100]]],
  ["Morocco fish", "meat_fish", [["1 kg", 2500], ["3 pieces", 2000]]],
  ["Smoked catfish", "meat_fish", [["1 kg", 5000]]],
  ["Whole chicken", "meat_fish", [["1 piece", 4500]]],

  ["Tomatoes", "vegetables", [["1 kg", 600], ["5 kg", 2800]]],
  ["Onions", "vegetables", [["1 kg", 700]]],
  ["Green peppers", "vegetables", [["1 kg", 900]]],
  ["Cabbage", "vegetables", [["1 piece", 500]]],
  ["Carrots", "vegetables", [["1 kg", 800]]],
  ["Njama njama", "vegetables", [["1 bunch", 200]]],

  ["Pineapple", "fruits", [["1 piece", 1000]]],
  ["Oranges", "fruits", [["1 kg", 500], ["Pack of 10", 1500]]],
  ["Papaya", "fruits", [["1 piece", 800]]],
  ["Ripe plantain", "fruits", [["1 bunch", 2500]]],
  ["Avocado", "fruits", [["1 piece", 300]]],

  ["Cassava", "tubers", [["1 kg", 300]]],
  ["Yams", "tubers", [["1 kg", 700]]],
  ["Sweet potatoes", "tubers", [["1 kg", 500]]],
  ["Cocoyams", "tubers", [["1 kg", 600]]],

  ["Rice", "grains", [["1 kg", 700], ["5 kg", 3300]]],
  ["Maize", "grains", [["1 kg", 400]]],
  ["Millet", "grains", [["1 kg", 500]]],

  ["Beans", "legumes", [["1 kg", 900]]],
  ["Groundnuts", "legumes", [["1 kg", 1200]]],
  ["Soybeans", "legumes", [["1 kg", 800]]],

  ["Ginger", "spices", [["250 g", 500]]],
  ["Garlic", "spices", [["250 g", 600]]],
  ["Hot pepper", "spices", [["100 g", 300]]],

  ["Palm oil", "oils", [["1 litre", 1500], ["5 litres", 7000]]],
  ["Groundnut oil", "oils", [["1 litre", 2000]]],

  ["Eggs", "dairy_eggs", [["Pack of 6", 700], ["Tray of 30", 3000]]],
  ["Fresh milk", "dairy_eggs", [["1 litre", 1000]]],
];

await mongoose.connect(process.env.MONGO_URI);

let added = 0;
for (const [name, category, variants] of SAMPLE) {
  const exists = await CatalogItem.exists({ name, category });
  if (exists) continue;
  await CatalogItem.create({
    name,
    category,
    variants: variants.map(([label, price]) => ({ label, price })),
  });
  added++;
}

console.log(`Catalogue ready: ${added} new items added`);
await mongoose.disconnect();