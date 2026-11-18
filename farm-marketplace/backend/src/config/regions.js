// The towns a seller can choose for each region. "Other" covers places not on the list.
// Keep this in step with TOWNS_BY_REGION in frontend/src/utils/constants.js.
export const OTHER_TOWN = "Other";

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

export const TOWNS_BY_REGION = Object.fromEntries(
  Object.entries(TOWNS).map(([region, towns]) => [region, [...towns, OTHER_TOWN]])
);
export const REGIONS = Object.keys(TOWNS_BY_REGION);