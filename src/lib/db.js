/**
 * Hybrid database: file-based locally, in-memory on Vercel serverless.
 * In production, replace with MongoDB/PostgreSQL/MySQL.
 */
import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV != null;
const DB_DIR = path.join(process.cwd(), 'data');

// In-memory store for serverless environments (Vercel)
const memStore = {};

function ensureDir() {
  if (!IS_VERCEL && !fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getFilePath(collection) {
  return path.join(DB_DIR, `${collection}.json`);
}

function readCollection(collection) {
  if (IS_VERCEL) {
    return memStore[collection] ? [...memStore[collection]] : [];
  }
  ensureDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return []; }
}

function writeCollection(collection, data) {
  if (IS_VERCEL) {
    memStore[collection] = [...data];
    return;
  }
  ensureDir();
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  find(collection, query = {}) {
    const data = readCollection(collection);
    return data.filter(item =>
      Object.entries(query).every(([key, val]) => item[key] === val)
    );
  },

  findOne(collection, query = {}) {
    const data = readCollection(collection);
    return data.find(item =>
      Object.entries(query).every(([key, val]) => item[key] === val)
    ) || null;
  },

  findById(collection, id) {
    const data = readCollection(collection);
    return data.find(item => item._id === id) || null;
  },

  insertOne(collection, document) {
    const data = readCollection(collection);
    const newDoc = {
      _id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      ...document,
    };
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc;
  },

  updateOne(collection, id, updates) {
    const data = readCollection(collection);
    const idx = data.findIndex(item => item._id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
    writeCollection(collection, data);
    return data[idx];
  },

  deleteOne(collection, id) {
    const data = readCollection(collection);
    const idx = data.findIndex(item => item._id === id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    writeCollection(collection, data);
    return true;
  },

  count(collection, query = {}) {
    return this.find(collection, query).length;
  },
};

let seeded = false;

export function seedDatabase() {
  // Only seed once per process lifetime
  if (seeded && IS_VERCEL) return;
  seeded = true;

  if (db.find('products').length === 0) {
    const products = [
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life.',
        price: 349.99, category: 'Audio', stock: 45, image: null, rating: 4.8, reviews: 2341,
      },
      {
        name: 'Apple MacBook Pro 14"',
        description: 'Supercharged by M3 Pro chip. Up to 22-hour battery life. Stunning Liquid Retina XDR display.',
        price: 1999.99, category: 'Laptops', stock: 12, image: null, rating: 4.9, reviews: 876,
      },
      {
        name: 'Samsung Galaxy Watch 6',
        description: 'Advanced health monitoring with body composition analysis and improved sleep tracking.',
        price: 299.99, category: 'Wearables', stock: 30, image: null, rating: 4.6, reviews: 1204,
      },
      {
        name: 'iPhone 15 Pro',
        description: 'Titanium design. A17 Pro chip. Most powerful iPhone ever, with a 48MP Main camera.',
        price: 999.99, category: 'Phones', stock: 25, image: null, rating: 4.9, reviews: 5623,
      },
      {
        name: 'iPad Air 5th Gen',
        description: 'Powerful. Colorful. Wonderful. M1 chip with 5G connectivity and beautiful 10.9" display.',
        price: 749.99, category: 'Tablets', stock: 18, image: null, rating: 4.7, reviews: 934,
      },
      {
        name: 'Logitech MX Master 3S',
        description: 'Ergonomic mouse with 8K DPI sensor, silent clicks, and USB-C charging.',
        price: 99.99, category: 'Accessories', stock: 60, image: null, rating: 4.8, reviews: 3201,
      },
      {
        name: 'Dell UltraSharp 27" 4K Monitor',
        description: 'IPS Black technology for deeper blacks and exceptional color accuracy with HDR600.',
        price: 699.99, category: 'Monitors', stock: 8, image: null, rating: 4.7, reviews: 652,
      },
      {
        name: 'Anker 65W USB-C Charger',
        description: 'GaN technology for a compact design. Charge laptop, phone, and tablet simultaneously.',
        price: 49.99, category: 'Accessories', stock: 100, image: null, rating: 4.6, reviews: 8921,
      },
    ];
    products.forEach(p => db.insertOne('products', p));
  }

  if (db.find('users').length === 0) {
    db.insertOne('users', { name: 'Admin User', email: 'admin@shopnex.com', password: 'admin123', role: 'admin' });
    db.insertOne('users', { name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user' });
  }
}
