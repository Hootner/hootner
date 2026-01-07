#!/usr/bin/env python3

class QueryParser:
    def __init__(self, query):
        self.query = query.strip()
    
    def parse(self):
        if '(' in self.query:
            inner = self.query.strip('()')
            if ' AND ' in inner:
                parts = inner.split(' AND ')
                return ('AND', parts[0].strip(), parts[1].strip())
            elif ' OR ' in inner:
                parts = inner.split(' OR ')
                return ('OR', parts[0].strip(), parts[1].strip())
        return ('TERM', self.query, None)

class QueryExecutor:
    def __init__(self, data):
        self.data = data
    
    def search(self, term):
        return {i for i, doc in enumerate(self.data) if term.lower() in doc.lower()}
    
    def execute(self, parsed_query):
        op, left, right = parsed_query
        
        if op == 'TERM':
            return self.search(left)
        
        left_results = self.search(left)
        right_results = self.search(right)
        
        if op == 'AND':
            return left_results & right_results
        elif op == 'OR':
            return left_results | right_results
        
        return set()

if __name__ == '__main__':
    docs = ["hello world", "world peace", "hello there", "goodbye world"]
    executor = QueryExecutor(docs)
    
    query1 = QueryParser("(hello AND world)")
    print(executor.execute(query1.parse()))  # {0}
    
    query2 = QueryParser("(hello OR peace)")
    print(executor.execute(query2.parse()))  # {0, 1, 2}
