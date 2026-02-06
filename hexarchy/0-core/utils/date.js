// Date & Time Utilities
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const diffInDays = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const diffInHours = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diff / (1000 * 60 * 60));
};

export const isExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

export const toISOString = (date) => {
  return new Date(date).toISOString();
};

export const fromUnix = (timestamp) => {
  return new Date(timestamp * 1000);
};

export const toUnix = (date) => {
  return Math.floor(new Date(date).getTime() / 1000);
};

export default {
  formatDate,
  addDays,
  addHours,
  diffInDays,
  diffInHours,
  isExpired,
  toISOString,
  fromUnix,
  toUnix
};
