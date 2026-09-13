const http = require('http');

const urls = [
  'http://localhost:8080/index.html',
  'http://localhost:8080/products.html',
  'http://localhost:8080/contact.html',
  'http://localhost:8080/css/style.css',
  'http://localhost:8080/js/main.js',
  'http://localhost:8080/data/category.csv',
  'http://localhost:8080/data/product.csv',
  'http://localhost:8080/images/banners/banner1.jpg',
  'http://localhost:8080/images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let dataLen = 0;
      res.on('data', chunk => dataLen += chunk.length);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, length: dataLen });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  for (const u of urls) {
    const r = await checkUrl(u);
    if (r.error) {
      console.log(`FAIL: ${r.url} -> ${r.error}`);
    } else {
      console.log(`PASS: ${r.url} -> ${r.status} (${r.length} bytes)`);
    }
  }
}

run();
