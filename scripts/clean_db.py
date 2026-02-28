#!/usr/bin/env python3
"""Clean all custom tables from Supabase public schema."""
import psycopg2

DB_URL = "postgresql://postgres.atjbwafqvyqniyybagsm:xoxe.xoxpMi0yLTEwMjU0MD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

# List all tables in public schema
cur.execute("""
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
""")
tables = [row[0] for row in cur.fetchall()]
print(f"Found {len(tables)} tables in public schema:")
for t in tables:
    print(f"  - {t}")

# Also list enums
cur.execute("""
    SELECT t.typname 
    FROM pg_type t 
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
    WHERE n.nspname = 'public' AND t.typtype = 'e'
    ORDER BY t.typname;
""")
enums = [row[0] for row in cur.fetchall()]
print(f"\nFound {len(enums)} custom enums:")
for e in enums:
    print(f"  - {e}")

# Drop all tables with CASCADE
if tables:
    table_list = ', '.join(f'"{t}"' for t in tables)
    drop_sql = f"DROP TABLE IF EXISTS {table_list} CASCADE;"
    print(f"\nExecuting: DROP TABLE ... CASCADE for {len(tables)} tables")
    cur.execute(drop_sql)
    print("All tables dropped successfully.")

# Drop all custom enums
for e in enums:
    cur.execute(f'DROP TYPE IF EXISTS "{e}" CASCADE;')
    print(f"Dropped enum: {e}")

# Verify
cur.execute("""
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
""")
remaining = cur.fetchall()
print(f"\nRemaining tables in public schema: {len(remaining)}")

cur.close()
conn.close()
print("Database cleanup complete.")
