#!/usr/bin/env python3
import re

class SimpleDB:
    def __init__(self):
        self.tables = {}
    
    def execute(self, sql):
        sql = sql.strip().rstrip(';')
        
        if sql.upper().startswith('CREATE TABLE'):
            match = re.match(r'CREATE TABLE (\w+) \((.*)\)', sql, re.IGNORECASE)
            table_name = match.group(1)
            self.tables[table_name] = {'schema': match.group(2), 'rows': []}
            return f"Table {table_name} created"
        
        elif sql.upper().startswith('INSERT INTO'):
            match = re.match(r'INSERT INTO (\w+) VALUES \((.*)\)', sql, re.IGNORECASE)
            table_name = match.group(1)
            values = [v.strip().strip("'\"") for v in match.group(2).split(',')]
            self.tables[table_name]['rows'].append(values)
            return "1 row inserted"
        
        elif sql.upper().startswith('SELECT'):
            match = re.match(r'SELECT \* FROM (\w+)', sql, re.IGNORECASE)
            table_name = match.group(1)
            return self.tables[table_name]['rows']
        
        return "Unknown command"

if __name__ == '__main__':
    db = SimpleDB()
    
    print(db.execute("CREATE TABLE users (id, name, age)"))
    print(db.execute("INSERT INTO users VALUES (1, 'Alice', 30)"))
    print(db.execute("INSERT INTO users VALUES (2, 'Bob', 25)"))
    print(db.execute("SELECT * FROM users"))
