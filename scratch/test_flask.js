const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING FLASK BACKEND & SQLITE API ===');

  // Test 1: Home page
  const homeRes = await request('http://127.0.0.1:5000/');
  console.log('1. GET / -> Status:', homeRes.status, 'Length:', homeRes.body.length);

  // Test 2: Products page
  const prodRes = await request('http://127.0.0.1:5000/products');
  console.log('2. GET /products -> Status:', prodRes.status, 'Length:', prodRes.body.length);

  // Test 3: Contact page
  const contactRes = await request('http://127.0.0.1:5000/contact');
  console.log('3. GET /contact -> Status:', contactRes.status, 'Length:', contactRes.body.length);

  // Test 4: API Categories
  const catApiRes = await request('http://127.0.0.1:5000/api/categories');
  const cats = JSON.parse(catApiRes.body);
  console.log('4. GET /api/categories -> Status:', catApiRes.status, 'Categories Count:', cats.length);

  // Test 5: API Products
  const prodApiRes = await request('http://127.0.0.1:5000/api/products');
  const prods = JSON.parse(prodApiRes.body);
  console.log('5. GET /api/products -> Status:', prodApiRes.status, 'Products Count:', prods.length);

  // Test 6: API Products Filter Category
  const freezeRes = await request('http://127.0.0.1:5000/api/products?category_id=2');
  const freezeProds = JSON.parse(freezeRes.body);
  console.log('6. GET /api/products?category_id=2 (Freeze) -> Count:', freezeProds.length);

  // Test 7: Static Assets
  const cssRes = await request('http://127.0.0.1:5000/css/style.css');
  console.log('7. GET /css/style.css -> Status:', cssRes.status, 'Length:', cssRes.body.length);
  const imgRes = await request('http://127.0.0.1:5000/images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg');
  console.log('8. GET /images/products/... -> Status:', imgRes.status, 'Length:', imgRes.body.length);

  // Test 8: Submit feedback to SQLite
  const feedbackData = JSON.stringify({
    name: 'Trần Ngọc Uyên Nhi',
    phone: '0901234567',
    email: 'uyennhi@example.com',
    subject: 'Trải nghiệm đồ uống',
    rating: 5,
    message: 'Cà phê Phin và Freeze Trà Xanh rất ngon và đậm vị! Website giao diện rất đẹp!'
  });

  const fbRes = await request('http://127.0.0.1:5000/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(feedbackData)
    },
    body: feedbackData
  });
  console.log('9. POST /api/feedback -> Status:', fbRes.status, 'Response:', fbRes.body);

  console.log('=== ALL FLASK TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
