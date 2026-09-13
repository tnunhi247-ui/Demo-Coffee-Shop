import sqlite3

conn = sqlite3.connect('coffeeshop.db')
cur = conn.cursor()

cust_count = cur.execute('SELECT COUNT(*) FROM customer').fetchone()[0]
order_count = cur.execute('SELECT COUNT(*) FROM "order"').fetchone()[0]
item_count = cur.execute('SELECT COUNT(*) FROM order_item').fetchone()[0]

print(f"Customer records: {cust_count}")
print(f"Order records: {order_count}")
print(f"Order Item records: {item_count}")

print("\n--- 3 ĐƠN HÀNG MỚI NHẤT ---")
orders = cur.execute('SELECT id, customer_id, total_amount, status, shipping_name, shipping_phone, shipping_address, payment_method, order_date FROM "order" ORDER BY id DESC LIMIT 3').fetchall()
for o in orders:
    print(o)

conn.close()
