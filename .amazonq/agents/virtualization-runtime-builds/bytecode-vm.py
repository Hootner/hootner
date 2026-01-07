#!/usr/bin/env python3

class BytecodeVM:
    def __init__(self):
        self.stack = []
        self.vars = {}
        self.pc = 0
    
    def run(self, bytecode):
        while self.pc < len(bytecode):
            op = bytecode[self.pc]
            self.pc += 1
            
            if op == 'LOAD_CONST':
                self.stack.append(bytecode[self.pc])
                self.pc += 1
            elif op == 'LOAD_VAR':
                self.stack.append(self.vars[bytecode[self.pc]])
                self.pc += 1
            elif op == 'STORE_VAR':
                self.vars[bytecode[self.pc]] = self.stack.pop()
                self.pc += 1
            elif op == 'ADD':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a + b)
            elif op == 'SUB':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a - b)
            elif op == 'MUL':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a * b)
            elif op == 'PRINT':
                print(self.stack.pop())
            elif op == 'HALT':
                break

if __name__ == '__main__':
    vm = BytecodeVM()
    
    # x = 10; y = 5; print(x + y * 2)
    bytecode = [
        'LOAD_CONST', 10,
        'STORE_VAR', 'x',
        'LOAD_CONST', 5,
        'STORE_VAR', 'y',
        'LOAD_VAR', 'x',
        'LOAD_VAR', 'y',
        'LOAD_CONST', 2,
        'MUL',
        'ADD',
        'PRINT',
        'HALT'
    ]
    
    vm.run(bytecode)
