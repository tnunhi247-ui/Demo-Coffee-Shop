const fs = require('fs');

const dataset = JSON.parse(fs.readFileSync('scratch/dataset.json', 'utf8'));

const mainJsContent = `/**
 * CoffeeShop - Main JavaScript Application
 * Handles Data Loading (CSV / Fallback), Carousel Slider, Product Filtering,
 * Search, Sorting, Mini Cart Drawer, Quick View Modal, and Contact Form.
 */

// Global State
const AppState = {
  categories: [],
  products: [],
  cart: [],
  selectedCategory: 0,
  searchQuery: '',
  sortBy: 'default',
  currentSlide: 0,
  carouselTimer: null
};

// Embedded Fallback Dataset (Used when running via file:// protocol where fetch is blocked by browser CORS)
const FALLBACK_DATASET = ${JSON.stringify(dataset, null, 2)};

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/**
 * Format number to Vietnamese Currency (VND)
 * @param {number} amount
 * @returns {string} e.g. "29.000 đ"
 */
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

/**
 * Clean and strip HTML tags from a string
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * RFC 4180 compliant CSV Parser
 * @param {string} text
 * @returns {Array<Array<string>>}
 */
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
      } else if (char === '\\r' && nextChar === '\\n') {
        row.push(field.trim());
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [];
        field = '';
        i++;
      } else if (char === '\\n' || char === '\\r') {
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

/**
 * Load Categories and Products from Flask API or CSV files with fallback
 */
async function loadAppData() {
  try {
    let catData = null;
    let prodData = null;

    try {
      const apiCatRes = await fetch('/api/categories');
      if (apiCatRes.ok) {
        catData = await apiCatRes.json();
      }
      const apiProdRes = await fetch('/api/products');
      if (apiProdRes.ok) {
        prodData = await apiProdRes.json();
      }
    } catch (e) {
      // Offline hoặc không chạy trên Flask
    }

    if (catData && prodData && catData.length > 0 && prodData.length > 0) {
      AppState.categories = catData;
      AppState.products = prodData;
      console.log('Successfully loaded data from Flask SQLite backend:', {
        categories: AppState.categories.length,
        products: AppState.products.length
      });
      return;
    }

    const [catResponse, prodResponse] = await Promise.all([
      fetch('data/category.csv'),
      fetch('data/product.csv')
    ]);

    if (!catResponse.ok || !prodResponse.ok) {
      throw new Error('Failed to fetch CSV files, switching to fallback dataset');
    }

    const catText = await catResponse.text();
    const prodText = await prodResponse.text();

    const catRows = parseCSV(catText);
    AppState.categories = catRows.slice(1).map(r => ({
      id: parseInt(r[0]),
      name: r[1],
      description: r[2] || ''
    }));

    const prodRows = parseCSV(prodText);
    AppState.products = prodRows.slice(1).map(r => ({
      id: parseInt(r[0]),
      name: r[1],
      price: parseFloat(r[2]) || 0,
      image: r[3],
      description: r[4] || '',
      published_date: r[5] || '',
      category_id: parseInt(r[6]) || 1
    }));

    console.log('Successfully loaded and parsed CSV data:', {
      categories: AppState.categories.length,
      products: AppState.products.length
    });
  } catch (error) {
    console.warn('Network notice (using embedded dataset for 100% offline & local compatibility):', error.message);
    AppState.categories = FALLBACK_DATASET.categories;
    AppState.products = FALLBACK_DATASET.products;
  }
}

/**
 * Get Category by ID
 */
function getCategoryById(catId) {
  return AppState.categories.find(c => c.id === catId) || { id: 0, name: 'Khác' };
}

/* ==========================================================================
   Shopping Cart Management
   ========================================================================== */

function initCart() {
  const savedCart = localStorage.getItem('coffeeshop_cart');
  if (savedCart) {
    try {
      AppState.cart = JSON.parse(savedCart);
    } catch (e) {
      AppState.cart = [];
    }
  }
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('coffeeshop_cart', JSON.stringify(AppState.cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(productId, quantity = 1) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = AppState.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    AppState.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: quantity
    });
  }

  saveCart();
  showToast('Thành công', \`Đã thêm "\${product.name}" vào giỏ hàng!\`, 'success');
}

function updateCartQty(productId, delta) {
  const item = AppState.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
  }
  saveCart();
}

function removeFromCart(productId) {
  const item = AppState.cart.find(i => i.id === productId);
  if (!item) return;
  AppState.cart = AppState.cart.filter(i => i.id !== productId);
  saveCart();
  showToast('Thông báo', \`Đã xóa "\${item.name}" khỏi giỏ hàng.\`, 'info');
}

function clearCart() {
  AppState.cart = [];
  saveCart();
}

function updateCartBadge() {
  const count = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = count;
  });
}

function renderCartDrawer() {
  const drawerBody = document.getElementById('cartDrawerBody');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!drawerBody) return;

  if (AppState.cart.length === 0) {
    drawerBody.innerHTML = \`
      <div style="text-align: center; padding: 50px 10px; color: var(--text-light);">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="fas fa-shopping-bag" style="font-size: 2rem; color: var(--accent);"></i>
        </div>
        <h4 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 6px; font-family: 'Plus Jakarta Sans', sans-serif;">Giỏ hàng của bạn đang trống</h4>
        <p style="font-size: 0.92rem; max-width: 260px; margin: 0 auto 20px;">Hãy khám phá các thức uống thơm ngon và thêm vào giỏ nhé!</p>
        <a href="products.html" class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">
          <i class="fas fa-th-large"></i> Khám phá Thực đơn
        </a>
      </div>
    \`;
    if (subtotalEl) subtotalEl.textContent = '0 đ';
    return;
  }

  let total = 0;
  let html = '';

  AppState.cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    html += \`
      <div class="cart-item-row">
        <div class="cart-item-thumb">
          <img src="\${item.image}" alt="\${item.name}" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">\${item.name}</h4>
          <div class="cart-item-price">\${formatVND(item.price)}</div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty(\${item.id}, -1)">-</button>
              <span class="qty-input" style="line-height: 44px;">\${item.qty}</span>
              <button class="qty-btn" onclick="updateCartQty(\${item.id}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(\${item.id})" title="Xóa món">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    \`;
  });

  drawerBody.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = formatVND(total);
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */

function showToast(title, message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = \`toast \${type === 'danger' ? 'toast-danger' : ''}\`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'info') iconClass = 'fa-info-circle';
  if (type === 'danger') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = \`
    <i class="fas \${iconClass}"></i>
    <div class="toast-msg">
      <h5>\${title}</h5>
      <p>\${message}</p>
    </div>
  \`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3400);
}

/* ==========================================================================
   Product Detail Modal (Quick View)
   ========================================================================== */

function openQuickView(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickViewModal');
  const modalContent = document.getElementById('modalProductDetails');
  if (!modal || !modalContent) return;

  const category = getCategoryById(product.category_id);
  const cleanDescription = stripHtml(product.description) || 
    'Thức uống được pha chế theo công thức chuẩn hương vị đậm đà, mang lại trải nghiệm tuyệt vời cho mọi khoảnh khắc.';
  const rating = (4.7 + ((product.id * 7) % 4) * 0.1).toFixed(1);
  const reviews = 20 + ((product.id * 17) % 75);

  modalContent.innerHTML = \`
    <div class="modal-body">
      <div class="modal-img-wrap">
        <img src="\${product.image}" alt="\${product.name}" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
      </div>
      <div class="modal-content-wrap">
        <span class="badge badge-caramel modal-cat-tag">\${category.name}</span>
        
        <div class="product-rating" style="margin-bottom: 12px;">
          <div class="stars" style="color: #F59E0B; display: flex; gap: 3px;">
            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <span class="rating-val" style="font-weight: 800; margin-left: 6px;">\${rating}</span>
          <span class="rating-count" style="color: var(--text-light); font-size: 0.82rem;">(\${reviews} lượt đánh giá)</span>
        </div>

        <h3>\${product.name}</h3>
        <div class="modal-price">\${formatVND(product.price)}</div>
        <div class="modal-desc">\${cleanDescription}</div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 0.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Kích cỡ ly (Size):</label>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-sm btn-secondary" style="background: var(--dark-gradient); color: white; border-color: var(--accent);">Vừa (M) - Chuẩn</button>
            <button type="button" class="btn btn-sm btn-secondary" style="background: var(--bg-surface-secondary); color: var(--text-main);">Lớn (L) +10.000đ</button>
          </div>
        </div>

        <div class="modal-actions">
          <div class="qty-control">
            <button class="qty-btn" id="modalQtyMinus">-</button>
            <input type="number" id="modalQtyInput" class="qty-input" value="1" min="1" max="99">
            <button class="qty-btn" id="modalQtyPlus">+</button>
          </div>
          <button class="btn btn-primary" id="modalAddToCartBtn" style="padding: 14px 34px;">
            <i class="fas fa-shopping-bag"></i> Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  \`;

  // Bind modal quantity handlers
  const qtyInput = document.getElementById('modalQtyInput');
  const qtyMinus = document.getElementById('modalQtyMinus');
  const qtyPlus = document.getElementById('modalQtyPlus');
  const addBtn = document.getElementById('modalAddToCartBtn');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      addToCart(product.id, qty);
      closeQuickView();
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Product Card HTML Template (Upgraded Menu Card)
   ========================================================================== */

function createProductCardHTML(product) {
  const category = getCategoryById(product.category_id);
  const cleanExcerpt = stripHtml(product.description) || 'Hương vị hảo hạng được tinh tuyển từ những nguyên liệu chất lượng hàng đầu.';
  const rating = (4.7 + ((product.id * 7) % 4) * 0.1).toFixed(1);
  const reviews = 20 + ((product.id * 17) % 75);
  
  const isHot = product.id % 5 === 1 || product.id === 1 || product.id === 7 || product.id === 24 || product.id === 29;
  const isNew = product.id % 7 === 0 || product.id === 10 || product.id === 22 || product.id === 36;

  let badgeHTML = '';
  if (isHot) {
    badgeHTML = \`<span class="product-flag badge-hot"><i class="fas fa-fire"></i> Hot</span>\`;
  } else if (isNew) {
    badgeHTML = \`<span class="product-flag badge-new"><i class="fas fa-sparkles"></i> Mới</span>\`;
  }

  return \`
    <div class="product-card" data-category="\${product.category_id}">
      <div class="product-thumb">
        <span class="product-cat-tag">\${category.name}</span>
        \${badgeHTML}
        <button class="product-quick-btn" onclick="openQuickView(\${product.id})" title="Xem chi tiết nhanh">
          <i class="fas fa-eye"></i>
        </button>
        <img src="\${product.image}" alt="\${product.name}" loading="lazy" onerror="this.src='images/products/HLC_New_logo_5.1_Products__PHIN_DEN_DA.jpg'">
      </div>
      <div class="product-info">
        <div class="product-rating">
          <div class="stars">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star\${rating >= 4.9 ? '' : '-half-alt'}"></i>
          </div>
          <span class="rating-val">\${rating}</span>
          <span class="rating-count">(\${reviews})</span>
        </div>
        <h3 class="product-title" onclick="openQuickView(\${product.id})" style="cursor: pointer;">\${product.name}</h3>
        <p class="product-excerpt">\${cleanExcerpt}</p>
        <div class="product-meta">
          <div class="price-wrap">
            <span class="price-label">Giá niêm yết</span>
            <span class="product-price">\${formatVND(product.price)}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart(\${product.id})" title="Thêm vào giỏ">
            <i class="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    </div>
  \`;
}

/* ==========================================================================
   Home Page: Carousel Slider
   ========================================================================== */

function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const container = document.querySelector('.carousel-container');

  if (!slides.length) return;

  function goToSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    AppState.currentSlide = index;
  }

  function nextSlide() {
    let nextIndex = (AppState.currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (AppState.currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  function startAutoPlay() {
    stopAutoPlay();
    AppState.carouselTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (AppState.carouselTimer) {
      clearInterval(AppState.carouselTimer);
      AppState.carouselTimer = null;
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      startAutoPlay();
    });
  });

  if (container) {
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
      let touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        startAutoPlay();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        startAutoPlay();
      }
    }, { passive: true });
  }

  startAutoPlay();
}

/* ==========================================================================
   Home Page: Latest Products & Category Cards
   ========================================================================== */

function renderHomePage() {
  // 1. Render Latest Products (Top 8 items by ID / latest added)
  const latestContainer = document.getElementById('latestProductsGrid');
  if (latestContainer) {
    const latestProducts = [...AppState.products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8);

    latestContainer.innerHTML = latestProducts.map(createProductCardHTML).join('');
  }

  // 2. Render Featured Category Cards
  const catContainer = document.getElementById('featuredCategoryGrid');
  if (catContainer) {
    const categoryIcons = {
      1: 'fa-mug-hot',
      2: 'fa-blender',
      3: 'fa-leaf',
      4: 'fa-cookie-bite'
    };

    let catHTML = '';
    AppState.categories.forEach(cat => {
      const count = AppState.products.filter(p => p.category_id === cat.id).length;
      const icon = categoryIcons[cat.id] || 'fa-coffee';
      catHTML += \`
        <div class="category-card" onclick="window.location.href='products.html?category=\${cat.id}'">
          <div class="category-icon-box">
            <i class="fas \${icon}"></i>
          </div>
          <h3>\${cat.name}</h3>
          <p>\${cat.description || 'Thưởng thức hương vị tươi ngon độc đáo được pha chế chuẩn vị tại CoffeeShop.'}</p>
          <span class="category-count">\${count} món ngon <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i></span>
        </div>
      \`;
    });
    catContainer.innerHTML = catHTML;
  }
}

/* ==========================================================================
   Products Page: Filtering, Searching & Sorting
   ========================================================================== */

function initProductsPage() {
  const gridContainer = document.getElementById('productsPageGrid');
  const tabsContainer = document.getElementById('categoryTabsContainer');
  const searchInput = document.getElementById('productSearchInput');
  const sortSelect = document.getElementById('productSortSelect');

  if (!gridContainer) return;

  // Check URL query parameters for ?category=id or ?search=kw
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    const catParam = parseInt(urlParams.get('category'));
    if (!isNaN(catParam)) {
      AppState.selectedCategory = catParam;
    }
  }
  if (urlParams.has('search')) {
    AppState.searchQuery = urlParams.get('search');
    if (searchInput) searchInput.value = AppState.searchQuery;
  }

  // 1. Render Category Filter Tabs
  if (tabsContainer) {
    const totalAll = AppState.products.length;
    const catIcons = {
      0: 'fa-th-large',
      1: 'fa-mug-hot',
      2: 'fa-blender',
      3: 'fa-leaf',
      4: 'fa-cookie-bite'
    };

    let tabsHTML = \`
      <button class="cat-tab-btn \${AppState.selectedCategory === 0 ? 'active' : ''}" data-cat="0">
        <i class="fas \${catIcons[0]}"></i> Tất cả <span class="badge-pill">\${totalAll}</span>
      </button>
    \`;

    AppState.categories.forEach(cat => {
      const count = AppState.products.filter(p => p.category_id === cat.id).length;
      const isActive = AppState.selectedCategory === cat.id;
      const icon = catIcons[cat.id] || 'fa-coffee';
      tabsHTML += \`
        <button class="cat-tab-btn \${isActive ? 'active' : ''}" data-cat="\${cat.id}">
          <i class="fas \${icon}"></i> \${cat.name} <span class="badge-pill">\${count}</span>
        </button>
      \`;
    });

    tabsContainer.innerHTML = tabsHTML;

    // Attach click events
    tabsContainer.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.selectedCategory = parseInt(btn.getAttribute('data-cat'));
        applyProductFilters();
      });
    });
  }

  // 2. Attach Search Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim().toLowerCase();
      applyProductFilters();
    });
  }

  // 3. Attach Sort Event
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      applyProductFilters();
    });
  }

  // Initial filter & render
  applyProductFilters();
}

function applyProductFilters() {
  const gridContainer = document.getElementById('productsPageGrid');
  const statusBar = document.getElementById('productStatusBar');
  if (!gridContainer) return;

  let filtered = [...AppState.products];

  // Category filter
  if (AppState.selectedCategory > 0) {
    filtered = filtered.filter(p => p.category_id === AppState.selectedCategory);
  }

  // Search filter
  if (AppState.searchQuery) {
    filtered = filtered.filter(p => {
      const name = p.name.toLowerCase();
      const desc = stripHtml(p.description).toLowerCase();
      return name.includes(AppState.searchQuery) || desc.includes(AppState.searchQuery);
    });
  }

  // Sort
  if (AppState.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (AppState.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (AppState.sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (AppState.sortBy === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Status text
  if (statusBar) {
    const categoryName = AppState.selectedCategory > 0 ? getCategoryById(AppState.selectedCategory).name : 'Tất cả';
    statusBar.innerHTML = \`
      <span>Hiển thị <strong>\${filtered.length}</strong> món ngon thuộc danh mục: <strong>\${categoryName}</strong></span>
      <span style="font-size: 0.85rem; color: var(--text-light);"><i class="fas fa-check-circle" style="color: var(--accent);"></i> Đang phục vụ</span>
    \`;
  }

  // Render Grid or Empty state
  if (filtered.length === 0) {
    gridContainer.innerHTML = \`
      <div class="empty-state">
        <i class="fas fa-mug-hot"></i>
        <h3>Không tìm thấy món nào phù hợp!</h3>
        <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc bấm nút đặt lại bộ lọc.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">
          <i class="fas fa-redo"></i> Đặt lại bộ lọc
        </button>
      </div>
    \`;
  } else {
    gridContainer.innerHTML = filtered.map(createProductCardHTML).join('');
  }
}

function resetFilters() {
  AppState.selectedCategory = 0;
  AppState.searchQuery = '';
  AppState.sortBy = 'default';

  const searchInput = document.getElementById('productSearchInput');
  const sortSelect = document.getElementById('productSortSelect');
  const tabsContainer = document.getElementById('categoryTabsContainer');

  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.cat-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === '0');
    });
  }

  applyProductFilters();
}

/* ==========================================================================
   Contact Page: Feedback Form, Rating & FAQ
   ========================================================================== */

function initContactPage() {
  const form = document.getElementById('feedbackForm');
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingText = document.getElementById('ratingText');
  const ratingInput = document.getElementById('ratingValueInput');

  let selectedRating = 5;
  const ratingLabels = {
    1: '1/5 - Chưa hài lòng',
    2: '2/5 - Tạm được',
    3: '3/5 - Bình thường',
    4: '4/5 - Rất hài lòng',
    5: '5/5 - Cực kỳ tuyệt vời!'
  };

  function updateStars(rating) {
    starBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'));
      btn.classList.toggle('active', val <= rating);
    });
    if (ratingText) ratingText.textContent = ratingLabels[rating] || '';
    if (ratingInput) ratingInput.value = rating;
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.getAttribute('data-value'));
      updateStars(selectedRating);
    });

    btn.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(btn.getAttribute('data-value'));
      starBtns.forEach(b => {
        const val = parseInt(b.getAttribute('data-value'));
        b.classList.toggle('hover', val <= hoverVal);
      });
    });

    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(b => b.classList.remove('hover'));
    });
  });

  updateStars(5);

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('feedbackName').value.trim();
      const phone = document.getElementById('feedbackPhone').value.trim();
      const email = document.getElementById('feedbackEmail') ? document.getElementById('feedbackEmail').value.trim() : '';
      const subject = document.getElementById('feedbackSubject') ? document.getElementById('feedbackSubject').value.trim() : 'Góp ý chung';
      const message = document.getElementById('feedbackMessage').value.trim();
      const submitBtn = document.getElementById('feedbackSubmitBtn');

      if (!name || !phone || !message) {
        showToast('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'danger');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi phản hồi...';
      }

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email,
            subject,
            rating: selectedRating,
            message
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Phản Hồi';
          }
          form.reset();
          updateStars(5);
          showToast('Cảm ơn bạn!', resData.message || \`CoffeeShop đã lưu phản hồi từ bạn (\${name}) vào CSDL!\`, 'success');
          return;
        }
      } catch (err) {
        // Fallback simulation
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Phản Hồi';
        }
        form.reset();
        updateStars(5);
        showToast('Cảm ơn bạn!', \`CoffeeShop đã nhận được phản hồi từ bạn (\${name}). Ý kiến của bạn giúp chúng tôi hoàn thiện hơn mỗi ngày!\`, 'success');
      }, 800);
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(f => f.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   Global Common Interactions (Header, Mobile Menu, Modals, Back-to-Top)
   ========================================================================== */

function initGlobalInteractions() {
  // Mobile Nav Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }

    // Back to Top button toggle
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (window.scrollY > 350) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  });

  // Back to Top click
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Cart Drawer open/close buttons
  const cartBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) {
        showToast('Thông báo', 'Giỏ hàng của bạn đang trống!', 'info');
        return;
      }
      showToast('Đặt hàng thành công', 'Cảm ơn bạn! Đơn hàng của bạn đã được tiếp nhận và sẽ được giao trong 30 phút.', 'success');
      clearCart();
      closeCartDrawer();
    });
  }

  // Quick view modal backdrop close & escape key
  const modal = document.getElementById('quickViewModal');
  const modalClose = document.getElementById('modalCloseBtn');
  if (modalClose) modalClose.addEventListener('click', closeQuickView);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeCartDrawer();
    }
  });
}

/* ==========================================================================
   Application Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Global Cart
  initCart();

  // 2. Initialize Navigation & Global UI Listeners
  initGlobalInteractions();

  // 3. Load Data from CSV
  await loadAppData();

  // 4. Page specific initializations
  if (document.querySelector('.carousel-container')) {
    initCarousel();
  }

  if (document.getElementById('latestProductsGrid') || document.getElementById('featuredCategoryGrid')) {
    renderHomePage();
  }

  if (document.getElementById('productsPageGrid')) {
    initProductsPage();
  }

  if (document.getElementById('feedbackForm') || document.querySelector('.faq-item')) {
    initContactPage();
  }
});
`;

fs.writeFileSync('js/main.js', mainJsContent, 'utf8');
fs.writeFileSync('static/js/main.js', mainJsContent, 'utf8');
console.log('Successfully re-generated js/main.js and static/js/main.js with upgraded design logic');
