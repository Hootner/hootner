class Compression {
    // Run-Length Encoding
    static rle_encode(data) {
        if (!data) return '';
        
        let encoded = '';
        let count = 1;
        let current = data[0];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i] === current && count < 255) {
                count++;
            } else {
                encoded += String.fromCharCode(count) + current;
                current = data[i];
                count = 1;
            }
        }
        encoded += String.fromCharCode(count) + current;
        
        return encoded;
    }
    
    static rle_decode(encoded) {
        let decoded = '';
        
        for (let i = 0; i < encoded.length; i += 2) {
            const count = encoded.charCodeAt(i);
            const char = encoded[i + 1];
            decoded += char.repeat(count);
        }
        
        return decoded;
    }
    
    // Huffman Coding (simplified)
    static buildFrequencyTable(data) {
        const freq = {};
        for (let char of data) {
            freq[char] = (freq[char] || 0) + 1;
        }
        return freq;
    }
    
    static huffman_encode(data) {
        const freq = this.buildFrequencyTable(data);
        const codes = {};
        
        // Simplified: assign shorter codes to frequent chars
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        sorted.forEach(([char, _], idx) => {
            codes[char] = idx.toString(2).padStart(8, '0');
        });
        
        let encoded = '';
        for (let char of data) {
            encoded += codes[char];
        }
        
        return { encoded, codes };
    }
    
    static huffman_decode(encoded, codes) {
        const reverseMap = {};
        for (let [char, code] of Object.entries(codes)) {
            reverseMap[code] = char;
        }
        
        let decoded = '';
        let buffer = '';
        
        for (let bit of encoded) {
            buffer += bit;
            if (reverseMap[buffer]) {
                decoded += reverseMap[buffer];
                buffer = '';
            }
        }
        
        return decoded;
    }
    
    // LZ77 (simplified)
    static lz77_encode(data, windowSize = 20) {
        const result = [];
        let i = 0;
        
        while (i < data.length) {
            let matchLength = 0;
            let matchDistance = 0;
            
            const searchStart = Math.max(0, i - windowSize);
            
            for (let j = searchStart; j < i; j++) {
                let length = 0;
                while (i + length < data.length && 
                       data[j + length] === data[i + length]) {
                    length++;
                }
                
                if (length > matchLength) {
                    matchLength = length;
                    matchDistance = i - j;
                }
            }
            
            if (matchLength > 2) {
                result.push({ distance: matchDistance, length: matchLength });
                i += matchLength;
            } else {
                result.push({ char: data[i] });
                i++;
            }
        }
        
        return result;
    }
}

// Test
const original = 'aaaaaabbbbbcccccddddd';
console.log('Original:', original, `(${original.length} bytes)`);

// RLE
const rle = Compression.rle_encode(original);
console.log('\nRLE encoded:', rle.length, 'bytes');
console.log('RLE decoded:', Compression.rle_decode(rle));
console.log('Compression ratio:', (original.length / rle.length).toFixed(2) + 'x');

// Huffman
const { encoded, codes } = Compression.huffman_encode(original);
console.log('\nHuffman encoded:', Math.ceil(encoded.length / 8), 'bytes');
console.log('Huffman decoded:', Compression.huffman_decode(encoded, codes));

// LZ77
const lz77 = Compression.lz77_encode(original);
console.log('\nLZ77 tokens:', lz77.length);

export default Compression;
