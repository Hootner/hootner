/**
 * Date handling utilities
 */

const date = {
  format: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const map = {
      YYYY: d.getFullYear(),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      DD: String(d.getDate()).padStart(2, '0'),
      HH: String(d.getHours()).padStart(2, '0'),
      mm: String(d.getMinutes()).padStart(2, '0'),
      ss: String(d.getSeconds()).padStart(2, '0')
    };
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match]);
  },

  parse: (str) => new Date(str),

  add: (date, amount, unit) => {
    const d = new Date(date);
    const units = {
      day: () => d.setDate(d.getDate() + amount),
      month: () => d.setMonth(d.getMonth() + amount),
      year: () => d.setFullYear(d.getFullYear() + amount),
      hour: () => d.setHours(d.getHours() + amount),
      minute: () => d.setMinutes(d.getMinutes() + amount)
    };
    units[unit]();
    return d;
  },

  diff: (date1, date2, unit = 'day') => {
    const ms = new Date(date1) - new Date(date2);
    const units = {
      day: ms / (1000 * 60 * 60 * 24),
      hour: ms / (1000 * 60 * 60),
      minute: ms / (1000 * 60),
      second: ms / 1000
    };
    return Math.floor(units[unit]);
  },

  fromNow: (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
};

if (typeof module !== 'undefined') module.exports = date;
