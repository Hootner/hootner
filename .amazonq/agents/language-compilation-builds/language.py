#!/usr/bin/env python3

def tokenize(chars):
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()

def parse(program):
    return read_from_tokens(tokenize(program))

def read_from_tokens(tokens):
    if len(tokens) == 0:
        raise SyntaxError('unexpected EOF')
    token = tokens.pop(0)
    if token == '(':
        L = []
        while tokens[0] != ')':
            L.append(read_from_tokens(tokens))
        tokens.pop(0)
        return L
    else:
        try:
            return int(token)
        except ValueError:
            return token

def eval(x, env=None):
    if env is None:
        env = {'+': lambda a, b: a + b, '-': lambda a, b: a - b, '*': lambda a, b: a * b}
    
    if isinstance(x, str):
        return env.get(x)
    elif not isinstance(x, list):
        return x
    elif x[0] == 'define':
        _, var, exp = x
        env[var] = eval(exp, env)
    else:
        proc = eval(x[0], env)
        args = [eval(arg, env) for arg in x[1:]]
        return proc(*args)

if __name__ == '__main__':
    print(eval(parse("(+ 2 3)")))  # 5
    print(eval(parse("(* (+ 2 3) 4)")))  # 20
