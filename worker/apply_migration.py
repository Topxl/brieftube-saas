#!/usr/bin/env python3
"""
Apply database migration using Supabase client
"""

import sys
from pathlib import Path
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

print("=" * 70)
print("🗄️  APPLYING DATABASE MIGRATION: 002_api_pipeline.sql")
print("=" * 70)

# Read migration file
migration_file = Path(__file__).parent.parent / "supabase" / "migrations" / "002_api_pipeline.sql"

if not migration_file.exists():
    print(f"❌ Migration file not found: {migration_file}")
    sys.exit(1)

with open(migration_file, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

print(f"\n📄 Migration file: {migration_file}")
print(f"📝 SQL length: {len(migration_sql)} characters")
print(f"🔗 Supabase URL: {SUPABASE_URL[:40]}...")

# Initialize Supabase client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✅ Supabase client initialized")
except Exception as e:
    print(f"❌ Failed to initialize Supabase: {e}")
    sys.exit(1)

# Apply migration
print("\n⏳ Applying migration...")
try:
    # Execute SQL using RPC or direct query
    # Supabase Python client doesn't have direct SQL execution
    # We need to use the REST API
    import requests

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    # Split SQL into individual statements (excluding comments and empty lines)
    statements = []
    current = []

    for line in migration_sql.split('\n'):
        line = line.strip()

        # Skip empty lines and pure comment lines
        if not line or line.startswith('--'):
            continue

        current.append(line)

        # Statement ends with semicolon
        if line.endswith(';'):
            stmt = ' '.join(current)
            if stmt and not stmt.startswith('COMMENT'):
                statements.append(stmt)
            current = []

    print(f"📊 Found {len(statements)} SQL statements to execute")

    # Execute each statement
    success_count = 0
    for i, stmt in enumerate(statements, 1):
        # Show preview
        preview = stmt[:80] + "..." if len(stmt) > 80 else stmt
        print(f"\n[{i}/{len(statements)}] Executing: {preview}")

        try:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=headers,
                json={"query": stmt}
            )

            # Most alterations return 404 or need different approach
            # Let's use the SQL editor endpoint
            response = supabase.rpc('exec_sql', {'query': stmt}).execute()

            print(f"    ✅ Success")
            success_count += 1

        except Exception as e:
            # Try alternative: postgrest doesn't support arbitrary SQL
            # We need to use psql or the dashboard
            print(f"    ⚠️  Cannot execute via API (expected): {str(e)[:100]}")

    print("\n" + "=" * 70)
    print("⚠️  Note: Supabase Python client cannot execute DDL statements")
    print("=" * 70)
    print("\nThe migration SQL has been prepared but needs to be applied via:")
    print("1. Supabase Dashboard → SQL Editor")
    print("2. Or using psql directly")
    print("\n📋 Migration SQL location:")
    print(f"   {migration_file}")
    print("\n💡 Quick apply: Copy the SQL and run it in Supabase SQL Editor")
    print("=" * 70)

except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
