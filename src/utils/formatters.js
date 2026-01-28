export const formatters = {
  // Currency formatter (Indian Rupee)
  currency: (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Date formatter (e.g., "15 Jan 2024")
  date: (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  },

  // DateTime formatter (e.g., "15 Jan 2024, 02:30 PM")
  dateTime: (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  },

  // Time formatter (e.g., "02:30 PM")
  time: (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  },

  // Uppercase formatter (trims and converts to uppercase)
  uppercase: (str) => {
    return str?.trim().toUpperCase() || '';
  },

  // Phone number formatter (adds spaces: 9876 543 210)
  phone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  },

  // Capitalize first letter of each word
  capitalize: (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // File size formatter (e.g., "1.5 MB")
  fileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Truncate text with ellipsis
  truncate: (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  // Relative time (e.g., "2 hours ago", "3 days ago")
  relativeTime: (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatters.date(date);
  },
};