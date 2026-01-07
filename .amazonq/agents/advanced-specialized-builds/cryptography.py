#!/usr/bin/env python3

class Crypto:
    @staticmethod
    def caesar_cipher(text, shift):
        result = ''
        for char in text:
            if char.isalpha():
                base = ord('A') if char.isupper() else ord('a')
                result += chr((ord(char) - base + shift) % 26 + base)
            else:
                result += char
        return result
    
    @staticmethod
    def xor_cipher(text, key):
        result = ''
        for i, char in enumerate(text):
            result += chr(ord(char) ^ ord(key[i % len(key)]))
        return result
    
    @staticmethod
    def simple_hash(text):
        hash_value = 0
        for char in text:
            hash_value = (hash_value * 31 + ord(char)) % (2**32)
        return hex(hash_value)[2:].zfill(8)
    
    @staticmethod
    def rsa_keygen(p=61, q=53):
        n = p * q
        phi = (p - 1) * (q - 1)
        e = 17
        
        # Find d such that (d * e) % phi == 1
        d = pow(e, -1, phi)
        
        return {'public': (e, n), 'private': (d, n)}
    
    @staticmethod
    def rsa_encrypt(message, public_key):
        e, n = public_key
        return [pow(ord(char), e, n) for char in message]
    
    @staticmethod
    def rsa_decrypt(ciphertext, private_key):
        d, n = private_key
        return ''.join([chr(pow(char, d, n)) for char in ciphertext])

# Test
crypto = Crypto()

# Caesar cipher
text = "Hello World"
encrypted = crypto.caesar_cipher(text, 3)
decrypted = crypto.caesar_cipher(encrypted, -3)
print(f"Caesar: {text} -> {encrypted} -> {decrypted}")

# XOR cipher
key = "secret"
encrypted = crypto.xor_cipher(text, key)
decrypted = crypto.xor_cipher(encrypted, key)
print(f"XOR: {text} -> {repr(encrypted)} -> {decrypted}")

# Hash
print(f"Hash: {crypto.simple_hash(text)}")

# RSA
keys = crypto.rsa_keygen()
message = "Hi"
encrypted = crypto.rsa_encrypt(message, keys['public'])
decrypted = crypto.rsa_decrypt(encrypted, keys['private'])
print(f"RSA: {message} -> {encrypted} -> {decrypted}")
