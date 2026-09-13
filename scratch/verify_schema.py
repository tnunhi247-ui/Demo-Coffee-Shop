import sqlite3
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

conn = sqlite3.connect('coffeeshop.db')
cursor = conn.cursor()

tables = ['category', 'book', 'customer', 'order', 'order_item']

for tbl in tables:
    print(f"\n--- TABLE: {tbl} ---")
    cursor.execute(f"PRAGMA table_info('{tbl}');")
    cols = cursor.fetchall()
    for c in cols:
        cid, name, ctype, notnull, dflt_value, pk = c
        pk_str = "PK" if pk else ""
        nn_str = "NOT NULL" if notnull else ""
        dflt_str = f"DEFAULT {dflt_value}" if dflt_value else ""
        print(f"  {name:<15} {ctype:<10} {pk_str:<5} {nn_str:<10} {dflt_str}")

    cursor.execute(f"PRAGMA foreign_key_list('{tbl}');")
    fks = cursor.fetchall()
    if fks:
        print("  Foreign Keys:")
        for fk in fks:
            print(f"    {fk[3]} -> {fk[2]}({fk[4]})")

conn.close()
