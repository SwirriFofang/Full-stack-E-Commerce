export const CURRENCY = "FCFA"; // change this to your currency

export const formatMoney = (n) => `${Number(n).toLocaleString()} ${CURRENCY}`;

export const formatDate = (d) =>
  new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

// "/uploads/abc.jpg" becomes "http://localhost:5000/uploads/abc.jpg"
// A picture's address. Cloudinary pictures are resized and sent in the best format for the browser.
export const fileUrl = (value, width = 600) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) {
    return value.includes("res.cloudinary.com") && value.includes("/upload/")
      ? value.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`)
      : value;
  }
  // Older pictures that are still kept on the server
  return `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")}${value}`;
};