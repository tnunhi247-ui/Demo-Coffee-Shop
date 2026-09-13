import os
import sys
import sqlite3
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory, flash, session
from werkzeug.security import generate_password_hash, check_password_hash

# Đảm bảo đầu ra UTF-8 trên console Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from init_db import init_db, DB_PATH

# Khởi tạo ứng dụng Flask
app = Flask(
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static'
)
app.secret_key = 'coffeeshop_secret_key_2026'

# Tự động tạo CSDL nếu chưa có
if not os.path.exists(DB_PATH):
    print("CSDL coffeeshop.db chưa tồn tại. Đang tự động khởi tạo...")
    init_db()

def get_db():
    """Tạo kết nối tới CSDL SQLite với định dạng trả về sqlite3.Row"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ==============================================================================
# Các Tuyến Đường Phục Vụ Tĩnh (Backward-compatible Assets)
# ==============================================================================
@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory(os.path.join(app.static_folder, 'images'), filename)

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

# ==============================================================================
# Các Trang Giao Diện Chính (Web Routes)
# ==============================================================================

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def home():
    """Trang chủ: Hiển thị Carousel Slide, Danh mục nổi bật và Sản phẩm mới nhất"""
    conn = get_db()
    
    # Lấy toàn bộ danh mục kèm số lượng sản phẩm
    categories = conn.execute("""
        SELECT c.id, c.name, c.description, COUNT(p.id) as product_count
        FROM category c
        LEFT JOIN product p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.id ASC
    """).fetchall()

    # Lấy 8 sản phẩm mới nhất
    latest_products = conn.execute("""
        SELECT p.*, c.name as category_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        ORDER BY p.id DESC
        LIMIT 8
    """).fetchall()

    conn.close()
    return render_template(
        'index.html',
        categories=categories,
        latest_products=latest_products
    )

@app.route('/products')
@app.route('/products.html')
def products():
    """Trang Sản phẩm: Lọc danh mục, tìm kiếm và sắp xếp từ SQLite"""
    category_id = request.args.get('category', type=int, default=0)
    search_query = request.args.get('search', type=str, default='').strip()
    sort_by = request.args.get('sort', type=str, default='default')

    conn = get_db()

    # Lấy danh sách danh mục
    categories = conn.execute("""
        SELECT c.id, c.name, c.description, COUNT(p.id) as product_count
        FROM category c
        LEFT JOIN product p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.id ASC
    """).fetchall()

    # Xây dựng câu truy vấn lọc sản phẩm
    query = """
        SELECT p.*, c.name as category_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        WHERE 1=1
    """
    params = []

    if category_id > 0:
        query += " AND p.category_id = ?"
        params.append(category_id)

    if search_query:
        query += " AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)"
        search_param = f"%{search_query.lower()}%"
        params.extend([search_param, search_param])

    # Sắp xếp
    if sort_by == 'price-asc':
        query += " ORDER BY p.price ASC"
    elif sort_by == 'price-desc':
        query += " ORDER BY p.price DESC"
    elif sort_by == 'name-asc':
        query += " ORDER BY p.name ASC"
    elif sort_by == 'name-desc':
        query += " ORDER BY p.name DESC"
    else:
        query += " ORDER BY p.id ASC"

    product_list = conn.execute(query, params).fetchall()
    conn.close()

    return render_template(
        'products.html',
        categories=categories,
        products=product_list,
        selected_category=category_id,
        search_query=search_query,
        sort_by=sort_by
    )

@app.route('/contact', methods=['GET', 'POST'])
@app.route('/contact.html', methods=['GET', 'POST'])
def contact():
    """Trang Liên hệ: Thông tin liên hệ và xử lý Form phản hồi/góp ý"""
    if request.method == 'POST':
        name = request.form.get('feedbackName', '').strip()
        phone = request.form.get('feedbackPhone', '').strip()
        email = request.form.get('feedbackEmail', '').strip()
        subject = request.form.get('feedbackSubject', 'Góp ý chung').strip()
        rating = request.form.get('ratingValueInput', type=int, default=5)
        message = request.form.get('feedbackMessage', '').strip()

        if name and phone and message:
            conn = get_db()
            conn.execute("""
                INSERT INTO feedback (name, phone, email, subject, rating, message)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, phone, email, subject, rating, message))
            conn.commit()
            conn.close()
            flash('Cảm ơn bạn! CoffeeShop đã ghi nhận phản hồi của bạn vào hệ thống.', 'success')
            return redirect(url_for('contact'))
        else:
            flash('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'danger')

    return render_template('contact.html')

# ==============================================================================
# RESTful API Endpoints (JSON)
# ==============================================================================

@app.route('/api/categories', methods=['GET'])
def api_categories():
    """API lấy danh sách danh mục"""
    conn = get_db()
    rows = conn.execute("SELECT id, name, description FROM category ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/products', methods=['GET'])
def api_products():
    """API lấy danh sách sản phẩm (có lọc theo category, search, sort)"""
    category_id = request.args.get('category_id', type=int, default=0)
    search = request.args.get('search', type=str, default='').strip().lower()
    sort = request.args.get('sort', type=str, default='default')

    conn = get_db()
    query = "SELECT * FROM product WHERE 1=1"
    params = []

    if category_id > 0:
        query += " AND category_id = ?"
        params.append(category_id)

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)"
        sp = f"%{search}%"
        params.extend([sp, sp])

    if sort == 'price-asc':
        query += " ORDER BY price ASC"
    elif sort == 'price-desc':
        query += " ORDER BY price DESC"
    elif sort == 'name-asc':
        query += " ORDER BY name ASC"
    elif sort == 'name-desc':
        query += " ORDER BY name DESC"
    else:
        query += " ORDER BY id ASC"

    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def api_product_detail(product_id):
    """API chi tiết một sản phẩm"""
    conn = get_db()
    row = conn.execute("SELECT * FROM product WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Không tìm thấy sản phẩm'}), 404
    return jsonify(dict(row))

@app.route('/api/feedback', methods=['POST'])
def api_feedback():
    """API tiếp nhận phản hồi từ giao diện người dùng"""
    data = request.get_json(silent=True) or request.form

    name = data.get('name') or data.get('feedbackName')
    phone = data.get('phone') or data.get('feedbackPhone')
    email = data.get('email') or data.get('feedbackEmail', '')
    subject = data.get('subject') or data.get('feedbackSubject', 'Góp ý chung')
    rating = int(data.get('rating') or data.get('ratingValueInput', 5))
    message = data.get('message') or data.get('feedbackMessage')

    if not name or not phone or not message:
        return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ thông tin bắt buộc (*)'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feedback (name, phone, email, subject, rating, message)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (name.strip(), phone.strip(), email.strip(), subject.strip(), rating, message.strip()))
    conn.commit()
    feedback_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'message': f'Cảm ơn bạn {name}! Phản hồi đã được lưu thành công vào CSDL (Mã #{feedback_id}).',
        'feedback_id': feedback_id
    })

@app.route('/api/books', methods=['GET'])
def api_books():
    """API lấy danh sách sách theo bảng book trong ERD"""
    category_id = request.args.get('category_id', type=int, default=0)
    search = request.args.get('search', type=str, default='').strip().lower()

    conn = get_db()
    query = "SELECT b.*, c.name as category_name FROM book b LEFT JOIN category c ON b.category_id = c.id WHERE 1=1"
    params = []

    if category_id > 0:
        query += " AND b.category_id = ?"
        params.append(category_id)

    if search:
        query += " AND (LOWER(b.title) LIKE ? OR LOWER(b.author) LIKE ?)"
        sp = f"%{search}%"
        params.extend([sp, sp])

    query += " ORDER BY b.id ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/books/<int:book_id>', methods=['GET'])
def api_book_detail(book_id):
    """API chi tiết một cuốn sách"""
    conn = get_db()
    row = conn.execute("""
        SELECT b.*, c.name as category_name 
        FROM book b 
        LEFT JOIN category c ON b.category_id = c.id 
        WHERE b.id = ?
    """, (book_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Không tìm thấy sách'}), 404
    return jsonify(dict(row))

@app.route('/api/customers', methods=['GET', 'POST'])
def api_customers():
    """API lấy hoặc tạo khách hàng theo bảng customer trong ERD"""
    conn = get_db()
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        fullname = data.get('fullname', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()

        if not fullname:
            return jsonify({'success': False, 'message': 'Họ tên là bắt buộc'}), 400

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO customer (fullname, email, phone, address)
            VALUES (?, ?, ?, ?)
        """, (fullname, email, phone, address))
        conn.commit()
        cust_id = cursor.lastrowid
        conn.close()
        return jsonify({'success': True, 'customer_id': cust_id}), 201

    rows = conn.execute("SELECT id, fullname, email, phone, address, created_at FROM customer ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/orders', methods=['GET', 'POST'])
def api_orders():
    """API quản lý đơn hàng theo bảng order & order_item trong ERD"""
    conn = get_db()
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        customer_id = data.get('customer_id')
        items = data.get('items', [])  # list of { book_id, quantity, unit_price }
        total_amount = data.get('total_amount', 0)
        status = data.get('status', 'pending')

        if not customer_id:
            return jsonify({'success': False, 'message': 'customer_id là bắt buộc'}), 400

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO "order" (customer_id, total_amount, status)
            VALUES (?, ?, ?)
        """, (customer_id, total_amount, status))
        order_id = cursor.lastrowid

        for item in items:
            b_id = item.get('book_id') or item.get('id')
            qty = int(item.get('quantity', 1))
            price = int(item.get('unit_price', 0))
            subtotal = qty * price
            cursor.execute("""
                INSERT INTO order_item (order_id, book_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, b_id, qty, price, subtotal))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'order_id': order_id}), 201

    # Lấy danh sách đơn hàng kèm chi tiết
    orders = conn.execute("""
        SELECT o.*, c.fullname as customer_name, c.email as customer_email, c.phone as customer_phone
        FROM "order" o
        LEFT JOIN customer c ON o.customer_id = c.id
        ORDER BY o.id DESC
    """).fetchall()

    result = []
    for ord_row in orders:
        ord_dict = dict(ord_row)
        items = conn.execute("""
            SELECT oi.*, b.title as book_title
            FROM order_item oi
            LEFT JOIN book b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        """, (ord_dict['id'],)).fetchall()
        ord_dict['items'] = [dict(i) for i in items]
        result.append(ord_dict)

    conn.close()
    return jsonify(result)

# ==============================================================================
# HỆ THỐNG XÁC THỰC (AUTHENTICATION) & TÀI KHOẢN KHÁCH HÀNG
# ==============================================================================

@app.route('/api/auth/register', methods=['POST'])
def api_auth_register():
    """Đăng ký tài khoản khách hàng mới"""
    data = request.get_json(silent=True) or request.form
    fullname = (data.get('fullname') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    password = (data.get('password') or '').strip()

    if not fullname:
        return jsonify({'success': False, 'message': 'Vui lòng nhập họ và tên!'}), 400
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Vui lòng nhập địa chỉ email hợp lệ!'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': 'Mật khẩu phải có ít nhất 6 ký tự!'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra email trùng
    existing = cursor.execute("SELECT id FROM customer WHERE LOWER(email) = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'Email này đã được đăng ký! Vui lòng chọn email khác hoặc đăng nhập.'}), 409

    pw_hash = generate_password_hash(password)
    cursor.execute("""
        INSERT INTO customer (fullname, email, phone, address, password)
        VALUES (?, ?, ?, ?, ?)
    """, (fullname, email, phone, address, pw_hash))
    conn.commit()
    customer_id = cursor.lastrowid
    conn.close()

    # Tự động đăng nhập qua Session
    session['customer_id'] = customer_id
    session['customer_name'] = fullname
    session['customer_email'] = email

    return jsonify({
        'success': True,
        'message': f'Chúc mừng {fullname}, tài khoản đã được đăng ký thành công!',
        'customer': {
            'id': customer_id,
            'fullname': fullname,
            'email': email,
            'phone': phone,
            'address': address
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    """Đăng nhập khách hàng bằng email và mật khẩu"""
    data = request.get_json(silent=True) or request.form
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ email và mật khẩu!'}), 400

    conn = get_db()
    customer = conn.execute("SELECT * FROM customer WHERE LOWER(email) = ?", (email,)).fetchone()
    conn.close()

    if not customer:
        return jsonify({'success': False, 'message': 'Email hoặc mật khẩu không chính xác!'}), 401

    pw_hash = customer['password']
    valid = False
    if pw_hash:
        try:
            valid = check_password_hash(pw_hash, password)
        except Exception:
            valid = (pw_hash == password)
    else:
        valid = (password == "123456")

    if not valid:
        return jsonify({'success': False, 'message': 'Email hoặc mật khẩu không chính xác!'}), 401

    session['customer_id'] = customer['id']
    session['customer_name'] = customer['fullname']
    session['customer_email'] = customer['email']

    return jsonify({
        'success': True,
        'message': f'Đăng nhập thành công! Chào mừng {customer["fullname"]}.',
        'customer': {
            'id': customer['id'],
            'fullname': customer['fullname'],
            'email': customer['email'],
            'phone': customer['phone'] or '',
            'address': customer['address'] or ''
        }
    })

@app.route('/api/auth/logout', methods=['POST', 'GET'])
def api_auth_logout():
    """Đăng xuất tài khoản hiện tại"""
    session.clear()
    return jsonify({'success': True, 'message': 'Đã đăng xuất thành công!'})

@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    """Lấy thông tin tài khoản đang đăng nhập"""
    customer_id = session.get('customer_id')
    if not customer_id:
        return jsonify({'logged_in': False})

    conn = get_db()
    customer = conn.execute("SELECT id, fullname, email, phone, address, created_at FROM customer WHERE id = ?", (customer_id,)).fetchone()
    conn.close()

    if not customer:
        session.clear()
        return jsonify({'logged_in': False})

    return jsonify({
        'logged_in': True,
        'customer': dict(customer)
    })

# ==============================================================================
# QUY TRÌNH ĐẶT HÀNG (CHECKOUT) & LỊCH SỬ ĐƠN HÀNG
# ==============================================================================

@app.route('/api/checkout', methods=['POST'])
def api_checkout():
    """Tạo đơn hàng từ giỏ hàng thực tế"""
    data = request.get_json(silent=True) or request.form
    items = data.get('items', [])
    if not items:
        return jsonify({'success': False, 'message': 'Giỏ hàng của bạn đang trống!'}), 400

    fullname = (data.get('fullname') or '').strip()
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    note = (data.get('note') or '').strip()
    payment_method = (data.get('payment_method') or 'cod').strip()
    email = (data.get('email') or '').strip().lower()

    if not fullname or not phone or not address:
        return jsonify({'success': False, 'message': 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!'}), 400

    conn = get_db()
    cursor = conn.cursor()

    customer_id = session.get('customer_id')
    if not customer_id and email:
        exist_cust = cursor.execute("SELECT id FROM customer WHERE LOWER(email) = ?", (email,)).fetchone()
        if exist_cust:
            customer_id = exist_cust['id']

    if not customer_id:
        import time
        cursor.execute("""
            INSERT INTO customer (fullname, email, phone, address)
            VALUES (?, ?, ?, ?)
        """, (fullname, email or f"guest_{int(time.time())}@coffeeshop.vn", phone, address))
        customer_id = cursor.lastrowid

    total_amount = 0
    parsed_items = []
    for item in items:
        prod_id = item.get('id') or item.get('book_id') or 1
        qty = max(1, int(item.get('quantity', 1)))
        price = int(float(item.get('price') or item.get('unit_price') or 0))
        subtotal = qty * price
        total_amount += subtotal
        parsed_items.append({
            'book_id': prod_id,
            'quantity': qty,
            'unit_price': price,
            'subtotal': subtotal
        })

    cursor.execute("""
        INSERT INTO "order" (customer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, payment_method, note)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)
    """, (customer_id, total_amount, fullname, phone, address, payment_method, note))
    order_id = cursor.lastrowid

    for it in parsed_items:
        cursor.execute("""
            INSERT INTO order_item (order_id, book_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        """, (order_id, it['book_id'], it['quantity'], it['unit_price'], it['subtotal']))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'order_id': order_id,
        'total_amount': total_amount,
        'message': f'Đơn hàng #{order_id} đã được đặt thành công! CoffeeShop sẽ liên hệ xác nhận trong ít phút.'
    }), 201

@app.route('/api/my-orders', methods=['GET'])
def api_my_orders():
    """Xem danh sách đơn hàng của khách hàng đang đăng nhập"""
    customer_id = session.get('customer_id')
    if not customer_id:
        return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để xem đơn hàng!'}), 401

    conn = get_db()
    orders = conn.execute("""
        SELECT * FROM "order"
        WHERE customer_id = ?
        ORDER BY id DESC
    """, (customer_id,)).fetchall()

    result = []
    for ord_row in orders:
        ord_dict = dict(ord_row)
        items = conn.execute("""
            SELECT oi.*, COALESCE(p.name, b.title, 'Sản phẩm cà phê') as product_name,
                   COALESCE(p.image, b.image, '') as product_image
            FROM order_item oi
            LEFT JOIN product p ON oi.book_id = p.id
            LEFT JOIN book b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        """, (ord_dict['id'],)).fetchall()
        ord_dict['items'] = [dict(i) for i in items]
        result.append(ord_dict)

    conn.close()
    return jsonify({'success': True, 'orders': result})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"CoffeeShop Flask App đang khởi chạy tại: http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
