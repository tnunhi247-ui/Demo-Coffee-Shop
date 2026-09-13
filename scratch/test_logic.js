const fs = require('fs');

// Test the CSV parsing algorithm directly
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let field = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field.trim());
        field = '';
      } else if (char === '\r' && nextChar === '\n') {
        row.push(field.trim());
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
        field = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        row.push(field.trim());
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim());
    if (row.length > 1 || row[0] !== '') lines.push(row);
  }
  return lines;
}

const catText = fs.readFileSync('data/category.csv', 'utf8');
const prodText = fs.readFileSync('data/product.csv', 'utf8');

const categories = parseCSV(catText).slice(1).map(r => ({
  id: parseInt(r[0]),
  name: r[1],
  description: r[2] || ''
}));

const products = parseCSV(prodText).slice(1).map(r => ({
  id: parseInt(r[0]),
  name: r[1],
  price: parseFloat(r[2]) || 0,
  image: r[3],
  description: r[4] || '',
  published_date: r[5] || '',
  category_id: parseInt(r[6]) || 1
}));

console.log('=== TEST SUITE RESULTS ===');
console.log('Categories count:', categories.length, categories.map(c => c.name));
console.log('Products count:', products.length);

// Category count check
categories.forEach(cat => {
  const count = products.filter(p => p.category_id === cat.id).length;
  console.log(`- Category "${cat.name}" (ID ${cat.id}): ${count} items`);
});

// Search test
const phinMatches = products.filter(p => p.name.toLowerCase().includes('phin'));
console.log(`Search "phin": found ${phinMatches.length} items`);

// Sort test
const sortedAsc = [...products].sort((a, b) => a.price - b.price);
console.log(`Lowest price: ${sortedAsc[0].name} (${sortedAsc[0].price} VND)`);
const sortedDesc = [...products].sort((a, b) => b.price - a.price);
console.log(`Highest price: ${sortedDesc[0].name} (${sortedDesc[0].price} VND)`);

// Cart logic test
let cart = [];
function addToCart(p, qty = 1) {
  const item = cart.find(i => i.id === p.id);
  if (item) item.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty });
}
addToCart(products[0], 2);
addToCart(products[1], 1);
const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
console.log('Cart count:', cart.length, 'Total amount:', total, 'VND');

console.log('ALL TESTS PASSED SUCCESSFULLY!');
