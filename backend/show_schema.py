import sqlite3
conn = sqlite3.connect('auricle_dev.db')
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table';")
for row in cursor.fetchall():
    print(row[0])
    print("-" * 40)
