// Cameroon mobile numbers: 9 digits starting with 6, with or without +237
export const cleanPhone = (value) => value.replace(/[\s-]/g, "").replace(/^\+?237/, "");
export const isValidPhone = (value) => /^6\d{8}$/.test(cleanPhone(value));