#!/usr/bin/env python3
import socket
import struct

def build_query(domain):
    query = b'\xaa\xaa'  # Transaction ID
    query += b'\x01\x00'  # Flags: standard query
    query += b'\x00\x01'  # Questions: 1
    query += b'\x00\x00'  # Answer RRs: 0
    query += b'\x00\x00'  # Authority RRs: 0
    query += b'\x00\x00'  # Additional RRs: 0
    
    for part in domain.split('.'):
        query += bytes([len(part)]) + part.encode()
    query += b'\x00'  # End of domain
    
    query += b'\x00\x01'  # Type: A
    query += b'\x00\x01'  # Class: IN
    
    return query

def parse_response(response):
    # Skip header (12 bytes) and question section
    offset = 12
    while response[offset] != 0:
        offset += response[offset] + 1
    offset += 5  # Skip null byte and type/class
    
    # Skip name pointer
    offset += 2
    
    # Read type, class, TTL
    offset += 8
    
    # Read IP address
    ip = '.'.join(str(b) for b in response[offset+2:offset+6])
    return ip

def dns_resolve(domain, dns_server='8.8.8.8'):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(5)
    
    query = build_query(domain)
    sock.sendto(query, (dns_server, 53))
    
    response, _ = sock.recvfrom(512)
    ip = parse_response(response)
    
    sock.close()
    return ip

if __name__ == '__main__':
    domain = 'example.com'
    ip = dns_resolve(domain)
    print(f"{domain} -> {ip}")
