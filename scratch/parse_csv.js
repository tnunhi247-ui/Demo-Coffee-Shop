const fs = require('fs');

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

const catContent = fs.readFileSync('data/category.csv', 'utf8');
const catRows = parseCSV(catContent);
const categories = catRows.slice(1).map(r => ({
  id: parseInt(r[0]),
  name: r[1],
  description: r[2] || ''
}));

const prodContent = fs.readFileSync('data/product.csv', 'utf8');
const prodRows = parseCSV(prodContent);
const products = prodRows.slice(1).map(r => ({
  id: parseInt(r[0]),
  name: r[1],
  price: parseFloat(r[2]) || 0,
  image: r[3],
  description: r[4] || '',
  published_date: r[5] || '',
  category_id: parseInt(r[6]) || 1
}));

console.log('Categories successfully parsed:', categories.length);
console.log('Products successfully parsed:', products.length);

fs.writeFileSync('scratch/dataset.json', JSON.stringify({ categories, products }, null, 2), 'utf8');
console.log('Saved to scratch/dataset.json');
