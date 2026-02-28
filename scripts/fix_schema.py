#!/usr/bin/env python3
"""
Convert camelCase DB column names in Drizzle schema to snake_case.

In Drizzle, the pattern is:
  fieldName: type("dbColumnName", ...)
  
We need to change "dbColumnName" to "db_column_name" where it's camelCase.
Also need to change camelCase table names to snake_case.
"""
import re
import sys

def camel_to_snake(name):
    """Convert camelCase to snake_case."""
    # Handle consecutive uppercase letters (e.g., "NPSScore" -> "nps_score")
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    result = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    return result

def is_camel_case(s):
    """Check if a string is camelCase (has at least one uppercase letter after a lowercase)."""
    return bool(re.search(r'[a-z][A-Z]', s))

def fix_schema_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    changes = []
    
    # Pattern 1: Fix table names in pgTable("tableName", ...)
    # Match pgTable("someTableName" or pgTable('someTableName'
    def fix_table_name(match):
        quote = match.group(1)
        table_name = match.group(2)
        if is_camel_case(table_name):
            new_name = camel_to_snake(table_name)
            changes.append(f"Table: {table_name} -> {new_name}")
            return f'pgTable({quote}{new_name}{quote}'
        return match.group(0)
    
    content = re.sub(r'pgTable\((["\'])([a-zA-Z_]+)\1', fix_table_name, content)
    
    # Pattern 2: Fix column names in type definitions
    # Match patterns like: type("columnName" or type('columnName'
    # These are the DB column names inside quotes after type functions
    # Types: varchar, text, integer, serial, boolean, decimal, timestamp, date, time, jsonb, real, customType
    type_funcs = r'(?:varchar|text|integer|serial|boolean|decimal|timestamp|date|time|jsonb|real|vector)'
    
    def fix_column_name(match):
        prefix = match.group(1)  # the type function call
        quote = match.group(2)
        col_name = match.group(3)
        suffix = match.group(4)
        
        if is_camel_case(col_name):
            new_name = camel_to_snake(col_name)
            changes.append(f"Column: {col_name} -> {new_name}")
            return f'{prefix}{quote}{new_name}{quote}{suffix}'
        return match.group(0)
    
    # Match type("colName", ...) or type("colName")
    content = re.sub(
        rf'({type_funcs}\()(["\'])([a-zA-Z_]+)\2(\)?)',
        fix_column_name,
        content
    )
    
    # Pattern 3: Fix pgEnum names
    def fix_enum_name(match):
        quote = match.group(1)
        enum_name = match.group(2)
        if is_camel_case(enum_name):
            new_name = camel_to_snake(enum_name)
            changes.append(f"Enum: {enum_name} -> {new_name}")
            return f'pgEnum({quote}{new_name}{quote}'
        return match.group(0)
    
    content = re.sub(r'pgEnum\((["\'])([a-zA-Z_]+)\1', fix_enum_name, content)
    
    # Pattern 4: Fix enum usage in column definitions like: planTypeEnum("planType")
    def fix_enum_column(match):
        enum_var = match.group(1)
        quote = match.group(2)
        col_name = match.group(3)
        if is_camel_case(col_name):
            new_name = camel_to_snake(col_name)
            changes.append(f"EnumCol: {col_name} -> {new_name}")
            return f'{enum_var}({quote}{new_name}{quote}'
        return match.group(0)
    
    # Match enumVarName("colName")
    content = re.sub(
        r'(\w+Enum)\((["\'])([a-zA-Z_]+)\2',
        fix_enum_column,
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}: {len(changes)} changes")
        # Print unique changes
        unique_changes = sorted(set(changes))
        for c in unique_changes:
            print(f"  {c}")
    else:
        print(f"No changes needed for {filepath}")
    
    return len(changes)

if __name__ == "__main__":
    files = sys.argv[1:] if len(sys.argv) > 1 else [
        "drizzle/schema.ts",
    ]
    total = 0
    for f in files:
        total += fix_schema_file(f)
    print(f"\nTotal changes: {total}")
