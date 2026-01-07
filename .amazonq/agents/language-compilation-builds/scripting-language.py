#!/usr/bin/env python3

class Token:
    def __init__(self, type, value):
        self.type = type
        self.value = value

class Interpreter:
    def __init__(self, text):
        self.text = text
        self.pos = 0
        self.current_token = None

    def get_next_token(self):
        if self.pos >= len(self.text):
            return Token('EOF', None)
        
        char = self.text[self.pos]
        
        if char.isspace():
            self.pos += 1
            return self.get_next_token()
        
        if char.isdigit():
            num = ''
            while self.pos < len(self.text) and self.text[self.pos].isdigit():
                num += self.text[self.pos]
                self.pos += 1
            return Token('INTEGER', int(num))
        
        if char == '+':
            self.pos += 1
            return Token('PLUS', char)
        
        if char == '-':
            self.pos += 1
            return Token('MINUS', char)
        
        raise Exception(f'Error parsing: {char}')

    def expr(self):
        self.current_token = self.get_next_token()
        left = self.current_token.value
        
        op = self.get_next_token()
        
        self.current_token = self.get_next_token()
        right = self.current_token.value
        
        if op.type == 'PLUS':
            return left + right
        elif op.type == 'MINUS':
            return left - right

if __name__ == '__main__':
    print(Interpreter("3 + 5").expr())   # 8
    print(Interpreter("10 - 3").expr())  # 7
