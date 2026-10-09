export function getCategoryEmoji(category) {
  const map = {
    Audio: '🎧',
    Laptops: '💻',
    Wearables: '⌚',
    Phones: '📱',
    Tablets: '📲',
    Accessories: '🖱️',
    Monitors: '🖥️',
    Gaming: '🎮',
    Cameras: '📷',
    default: '📦',
  };
  return map[category] || map.default;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export const CATEGORIES = ['All', 'Audio', 'Laptops', 'Phones', 'Tablets', 'Wearables', 'Monitors', 'Accessories'];
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];
