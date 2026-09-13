import sqlite3
import csv
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DB_PATH = 'coffeeshop.db'
DATA_DIR = 'data'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Bật tính năng kiểm tra khóa ngoại (Foreign Key)
    cursor.execute("PRAGMA foreign_keys = ON;")

    # =========================================================================
    # 1. BẢNG category (Danh mục sách / đồ uống)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
    );
    """)

    # =========================================================================
    # 2. BẢNG book (Thông tin sách - Theo đúng sơ đồ ERD trong hình)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY,
        category_id INTEGER,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        publish_year INTEGER,
        price INTEGER NOT NULL,
        image TEXT,
        in_stock INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL
    );
    """)

    # =========================================================================
    # 3. BẢNG customer (Thông tin khách hàng - Theo đúng sơ đồ ERD & bổ sung password)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        password TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Tự động thêm cột password nếu bảng customer đã tồn tại trước đó mà chưa có
    try:
        cursor.execute("ALTER TABLE customer ADD COLUMN password TEXT;")
    except sqlite3.OperationalError:
        pass  # Đã tồn tại cột password

    # =========================================================================
    # 4. BẢNG order (Đơn hàng của khách - Theo đúng sơ đồ ERD trong hình)
    # Lưu ý: "order" là từ khóa SQL nên được bọc trong ngoặc kép
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS "order" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total_amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        shipping_name TEXT,
        shipping_phone TEXT,
        shipping_address TEXT,
        payment_method TEXT DEFAULT 'cod',
        note TEXT,
        FOREIGN KEY (customer_id) REFERENCES customer (id) ON DELETE CASCADE
    );
    """)

    # Tự động thêm các cột giao hàng nếu bảng order đã tồn tại từ trước
    for col in [
        ("shipping_name", "TEXT"),
        ("shipping_phone", "TEXT"),
        ("shipping_address", "TEXT"),
        ("payment_method", "TEXT DEFAULT 'cod'"),
        ("note", "TEXT")
    ]:
        try:
            cursor.execute(f'ALTER TABLE "order" ADD COLUMN {col[0]} {col[1]};')
        except sqlite3.OperationalError:
            pass

    # =========================================================================
    # 5. BẢNG order_item (Chi tiết từng cuốn / món trong đơn hàng - Theo ERD)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        book_id INTEGER,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE SET NULL
    );
    """)

    # =========================================================================
    # 6. BẢNG product (Bảo toàn dữ liệu sản phẩm cho giao diện CoffeeShop)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT,
        description TEXT,
        published_date TEXT,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL
    );
    """)

    # =========================================================================
    # 7. BẢNG feedback (Lưu trữ góp ý từ form liên hệ)
    # =========================================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        subject TEXT,
        rating INTEGER DEFAULT 5,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()

    # -------------------------------------------------------------------------
    # IMPORT DỮ LIỆU TỪ category.csv
    # -------------------------------------------------------------------------
    category_file = os.path.join(DATA_DIR, 'category.csv')
    if os.path.exists(category_file):
        with open(category_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                INSERT OR REPLACE INTO category (id, name, description)
                VALUES (?, ?, ?)
                """, (int(row['id']), row['name'].strip(), row['description'].strip() if row.get('description') else ''))
        print("Đã import dữ liệu Category thành công!")

    # -------------------------------------------------------------------------
    # IMPORT DỮ LIỆU TỪ product.csv -> product & book
    # -------------------------------------------------------------------------
    product_file = os.path.join(DATA_DIR, 'product.csv')
    if os.path.exists(product_file):
        with open(product_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                p_id = int(row['id'])
                p_name = row['name'].strip()
                p_price = int(float(row['price']))
                p_image = row['image'].strip()
                p_desc = row['description'].strip() if row.get('description') else ''
                p_date = row['published_date'].strip() if row.get('published_date') else ''
                p_cat_id = int(row['category_id']) if row.get('category_id') else 1

                # Lưu vào bảng product
                cursor.execute("""
                INSERT OR REPLACE INTO product (id, name, price, image, description, published_date, category_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (p_id, p_name, p_price, p_image, p_desc, p_date, p_cat_id))

                # Đồng thời nạp vào bảng book theo đúng các trường trong ERD:
                # (id, category_id, title, author, publish_year, price, image, in_stock)
                cursor.execute("""
                INSERT OR REPLACE INTO book (id, category_id, title, author, publish_year, price, image, in_stock)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (p_id, p_cat_id, p_name, "CoffeeShop Publisher", 2024, p_price, p_image, 1))

        print("Đã import dữ liệu Product & Book thành công!")

    # -------------------------------------------------------------------------
    # TẠO DỮ LIỆU MẪU CHO customer, order, order_item
    # -------------------------------------------------------------------------
    from werkzeug.security import generate_password_hash
    default_pw_hash = generate_password_hash("123456")

    cursor.execute("SELECT COUNT(*) FROM customer;")
    if cursor.fetchone()[0] == 0:
        customers = [
            ("Trần Ngọc Uyên Nhi", "uyennhi@example.com", "0901234567", "123 Đường Cà Phê, Quận 1, TP.HCM", default_pw_hash),
            ("Nguyễn Văn An", "nguyenvanan@example.com", "0912345678", "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM", default_pw_hash),
            ("Lê Thị Mai", "lethimai@example.com", "0987654321", "789 Nguyễn Huệ, Quận 1, TP.HCM", default_pw_hash)
        ]
        for c in customers:
            cursor.execute("""
            INSERT INTO customer (fullname, email, phone, address, password)
            VALUES (?, ?, ?, ?, ?)
            """, c)
        print("Đã tạo dữ liệu mẫu cho bảng Customer!")
    else:
        # Cập nhật password cho các khách hàng đã có nếu đang NULL
        cursor.execute("UPDATE customer SET password = ? WHERE password IS NULL OR password = '';", (default_pw_hash,))

    cursor.execute('SELECT COUNT(*) FROM "order";')
    if cursor.fetchone()[0] == 0:
        # Đơn hàng 1 của khách hàng 1
        cursor.execute("""
        INSERT INTO "order" (customer_id, total_amount, status)
        VALUES (1, 104000, 'paid')
        """)
        order_1_id = cursor.lastrowid
        cursor.execute("""
        INSERT INTO order_item (order_id, book_id, quantity, unit_price, subtotal)
        VALUES (?, 1, 2, 29000, 58000)
        """, (order_1_id,))
        cursor.execute("""
        INSERT INTO order_item (order_id, book_id, quantity, unit_price, subtotal)
        VALUES (?, 5, 1, 45000, 45000)
        """, (order_1_id,))

        # Đơn hàng 2 của khách hàng 2
        cursor.execute("""
        INSERT INTO "order" (customer_id, total_amount, status)
        VALUES (2, 69000, 'pending')
        """)
        order_2_id = cursor.lastrowid
        cursor.execute("""
        INSERT INTO order_item (order_id, book_id, quantity, unit_price, subtotal)
        VALUES (?, 2, 1, 69000, 69000)
        """, (order_2_id,))

        print("Đã tạo dữ liệu mẫu cho bảng Order và Order_Item!")

    conn.commit()

    # -------------------------------------------------------------------------
    # KIỂM TRA BÁO CÁO CÁC BẢNG
    # -------------------------------------------------------------------------
    tables = ['category', 'book', 'customer', 'order', 'order_item', 'product', 'feedback']
    print(f"\n=== TỔNG KẾT CƠ SỞ DỮ LIỆU ({DB_PATH}) ===")
    for tbl in tables:
        cursor.execute(f'SELECT COUNT(*) FROM "{tbl}";')
        count = cursor.fetchone()[0]
        print(f"- Bảng [{tbl}]: {count} bản ghi")

    conn.close()

if __name__ == '__main__':
    init_db()
