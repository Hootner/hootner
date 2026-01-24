// Formatting Utilities

// Format duration in seconds to HH:MM:SS or MM:SS
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format view count (e.g., 1.2M, 45K, 123)
export function formatViews(views) {
  if (!views || isNaN(views)) return '0';

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

// Format number (e.g., 1,234,567)
export function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  return num.toLocaleString();
}

// Format date (e.g., "2 hours ago", "3 days ago", "Jan 15, 2026")
export function formatDate(date) {
  if (!date) return '';

  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

// Format file size (bytes to KB, MB, GB)
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Format currency (USD)
export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
  if (!value || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

// Truncate text with ellipsis
export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
