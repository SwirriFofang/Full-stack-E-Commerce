// [value stored in the database, label shown to the user]
export const CATEGORIES = [
  ["tubers", "Tubers"],
  ["vegetables", "Vegetables"],
  ["fruits", "Fruits"],
  ["grains", "Grains"],
  ["legumes", "Legumes"],
  ["spices", "Spices"],
  ["oils", "Oils"],
  ["meat_fish", "Meat and fish"],
  ["dairy_eggs", "Dairy and eggs"],
];

const TOWNS = {
  Adamawa: ["Ngaoundéré", "Meiganga", "Tibati", "Banyo", "Tignère", "Ngaoundal", "Bélel", "Mbé"],
  Centre: [
    "Yaoundé", "Mbalmayo", "Obala", "Bafia", "Mbandjock", "Akonolinga", "Eséka",
    "Monatélé", "Ntui", "Nanga-Eboko", "Mfou", "Ayos", "Saa", "Okola", "Ngoumou",
  ],
  East: ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Garoua-Boulaï", "Bélabo", "Lomié", "Moloundou", "Doumé"],
  "Far North": ["Maroua", "Kousséri", "Mokolo", "Yagoua", "Mora", "Kaélé", "Bogo", "Maga", "Tokombéré", "Mindif"],
  Littoral: ["Douala", "Nkongsamba", "Edéa", "Loum", "Mbanga", "Manjo", "Njombé-Penja", "Yabassi", "Melong", "Dibombari"],
  North: ["Garoua", "Guider", "Figuil", "Poli", "Tcholliré", "Pitoa", "Lagdo", "Touboro", "Mayo-Oulo", "Rey-Bouba"],
  Northwest: ["Bamenda", "Kumbo", "Wum", "Nkambe", "Mbengwi", "Ndop", "Bali", "Fundong", "Bafut", "Batibo", "Jakiri", "Ndu"],
  South: ["Ebolowa", "Kribi", "Sangmélima", "Ambam", "Campo", "Lolodorf", "Djoum", "Mvangan", "Akom II", "Bipindi", "Zoétélé", "Meyomessala"],
  Southwest: ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko", "Mutengene", "Muyuka", "Bangem", "Mundemba", "Fontem", "Idenau", "Ekondo-Titi"],
  West: ["Bafoussam", "Dschang", "Mbouda", "Foumban", "Bangangté", "Bafang", "Foumbot", "Bandjoun", "Kékem", "Baham", "Batié", "Bazou"],
};

// "Other" covers places that are not on the list
export const TOWNS_BY_REGION = Object.fromEntries(
  Object.entries(TOWNS).map(([region, towns]) => [region, [...towns, "Other"]])
);
export const REGIONS = Object.keys(TOWNS_BY_REGION);

export const CATEGORY_EMOJI = {
  tubers: "Tuber",
  vegetables: "Vegs",
  fruits: "Fruits",
  grains: "Grains",
  legumes: "Beans",
  spices: "Spices",
  oils: "Oils",
  meat_fish: "Meat and fish",
  dairy_eggs: "Dairy and eggs",
};
// Must match the units the backend accepts
export const UNITS = [
  "kg",
  "bag",
  "bunch",
  "crate",
  "basket",
  "piece",
  "litre"
];

export const PAYMENT_METHODS = {
  momo_mtn: "MTN Mobile Money",
  momo_orange: "Orange Money",
  bank_transfer: "Bank transfer",
};

// REPLACE these placeholders with your real bank details.
// Add more objects to the list if you have several accounts.
export const BANK_ACCOUNTS = [
  {
    bank: "[Bank name]",
    accountName: "[Account holder name]",
    accountNumber: "[Account number]",
    branch: "[Branch or town]",
  },
];

export const SITE_NAME = "FarmFresh";

// REPLACE the placeholders with your real contact details
export const CONTACT = {
  address: "[Your street and town]",
  email: "[info@yourdomain.com]",
  phone: "[Your phone number]",
  whatsapp: "[Your WhatsApp number]",
};

// REPLACE with your real social media pages
export const SOCIAL = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/",
};