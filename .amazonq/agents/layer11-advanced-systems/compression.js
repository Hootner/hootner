#!/usr/bin/env node
/**
 * Layer 11: Compression - Data compression algorithms
 * Dependencies: Layer 0 (Binary), Layer 6 (Database)
 */

class Compression {
  // Huffman coding
  static huffman(text) {
    // Build frequency table
    const freq = new Map();
    for (const char of text) {
      freq.set(char, (freq.get(char) || 0) + 1);
    }
    
    // Build Huffman tree
    const nodes = Array.from(freq.entries()).map(([char, freq]) => ({
      char, freq, left: null, right: null
    }));
    
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift();
      const right = nodes.shift();
      
      nodes.push({
        char: null,
        freq: left.freq + right.freq,
        left,
        right
      });
    }
    
    const root = nodes[0];
    
    // Build code table
    const codes = new Map();
    const buildCodes = (node, code = '') => {
      if (node.char !== null) {
        codes.set(node.char, code || '0');
        return;
      }
      if (node.left) buildCodes(node.left, code + '0');
      if (node.right) buildCodes(node.right, code + '1');
    };
    buildCodes(root);
    
    // Encode
    const encoded = text.split('').map(c => codes.get(c)).join('');
    
    console.log(`[HUFFMAN] ${text.length * 8} bits -> ${encoded.length} bits (${(encoded.length / (text.length * 8) * 100).toFixed(1)}%)`);
    
    return { encoded, codes, tree: root };
  }

  // Huffman decode
  static huffmanDecode(encoded, tree) {
    let decoded = '';
    let node = tree;
    
    for (const bit of encoded) {
      node = bit === '0' ? node.left : node.right;
      
      if (node.char !== null) {
        decoded += node.char;
        node = tree;
      }
    }
    
    return decoded;
  }

  // Run-length encoding
  static rle(text) {
    let encoded = '';
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      let count = 1;
      
      while (i + count < text.length && text[i + count] === char) {
        count++;
      }
      
      encoded += count > 1 ? `${count}${char}` : char;
      i += count;
    }
    
    console.log(`[RLE] ${text.length} -> ${encoded.length} chars`);
    return encoded;
  }

  // RLE decode
  static rleDecode(encoded) {
    let decoded = '';
    let i = 0;
    
    while (i < encoded.length) {
      if (/\d/.test(encoded[i])) {
        const count = parseInt(encoded[i]);
        decoded += encoded[i + 1].repeat(count);
        i += 2;
      } else {
        decoded += encoded[i];
        i++;
      }
    }
    
    return decoded;
  }

  // LZ77 compression
  static lz77(text, windowSize = 20) {
    const result = [];
    let i = 0;
    
    while (i < text.length) {
      let matchLength = 0;
      let matchDistance = 0;
      
      // Search for longest match in window
      const searchStart = Math.max(0, i - windowSize);
      
      for (let j = searchStart; j < i; j++) {
        let length = 0;
        
        while (i + length < text.length && text[j + length] === text[i + length]) {
          length++;
        }
        
        if (length > matchLength) {
          matchLength = length;
          matchDistance = i - j;
        }
      }
      
      if (matchLength > 2) {
        result.push({ distance: matchDistance, length: matchLength, next: text[i + matchLength] || '' });
        i += matchLength + 1;
      } else {
        result.push({ distance: 0, length: 0, next: text[i] });
        i++;
      }
    }
    
    console.log(`[LZ77] ${text.length} chars -> ${result.length} tokens`);
    return result;
  }

  // LZ77 decompress
  static lz77Decode(tokens) {
    let decoded = '';
    
    for (const { distance, length, next } of tokens) {
      if (length > 0) {
        const start = decoded.length - distance;
        for (let i = 0; i < length; i++) {
          decoded += decoded[start + i];
        }
      }
      decoded += next;
    }
    
    return decoded;
  }

  // Calculate compression ratio
  static ratio(original, compressed) {
    return ((1 - compressed / original) * 100).toFixed(1) + '%';
  }
}

// Demo
if (require.main === module) {
  console.log('=== Compression Demo ===\n');
  
  // Huffman coding
  const text1 = 'hello world';
  const { encoded, codes, tree } = Compression.huffman(text1);
  console.log('Codes:', Object.fromEntries(codes));
  const decoded1 = Compression.huffmanDecode(encoded, tree);
  console.log('Decoded:', decoded1);
  console.log('Match:', text1 === decoded1);
  
  console.log();
  
  // Run-length encoding
  const text2 = 'aaabbbcccdddd';
  const rle = Compression.rle(text2);
  console.log('RLE:', rle);
  const decoded2 = Compression.rleDecode(rle);
  console.log('Decoded:', decoded2);
  console.log('Match:', text2 === decoded2);
  
  console.log();
  
  // LZ77
  const text3 = 'abcabcabcabc';
  const lz77 = Compression.lz77(text3);
  console.log('LZ77 tokens:', lz77.length);
  const decoded3 = Compression.lz77Decode(lz77);
  console.log('Decoded:', decoded3);
  console.log('Match:', text3 === decoded3);
}

module.exports = Compression;
