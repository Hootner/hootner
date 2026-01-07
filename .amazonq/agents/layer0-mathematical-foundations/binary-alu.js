// Binary Arithmetic Unit - Layer 0.3
// Foundation: Math operations in binary

class BinaryALU {
  // Convert to binary
  toBinary(n, bits = 8) {
    return (n >>> 0).toString(2).padStart(bits, '0');
  }

  // Convert from binary
  fromBinary(bin) {
    return parseInt(bin, 2);
  }

  // Add two binary numbers
  add(a, b) {
    let carry = 0;
    let result = '';
    
    a = this.toBinary(a);
    b = this.toBinary(b);
    
    for (let i = a.length - 1; i >= 0; i--) {
      const bitA = parseInt(a[i]);
      const bitB = parseInt(b[i]);
      const sum = bitA + bitB + carry;
      
      result = (sum % 2) + result;
      carry = Math.floor(sum / 2);
    }
    
    return { binary: result, decimal: this.fromBinary(result), carry };
  }

  // Subtract using two's complement
  subtract(a, b) {
    const notB = this.NOT(b);
    const twosComp = this.add(notB, 1);
    return this.add(a, twosComp.decimal);
  }

  // Bitwise NOT
  NOT(n) {
    return ~n & 0xFF;
  }

  // Bitwise AND
  AND(a, b) {
    return a & b;
  }

  // Bitwise OR
  OR(a, b) {
    return a | b;
  }

  // Bitwise XOR
  XOR(a, b) {
    return a ^ b;
  }

  // Shift left
  SHL(n, bits) {
    return (n << bits) & 0xFF;
  }

  // Shift right
  SHR(n, bits) {
    return n >> bits;
  }

  // Multiply (repeated addition)
  multiply(a, b) {
    let result = 0;
    for (let i = 0; i < b; i++) {
      result = this.add(result, a).decimal;
    }
    return result;
  }
}

// Demo
const alu = new BinaryALU();
console.log('5 + 3 =', alu.add(5, 3));
console.log('5 - 3 =', alu.subtract(5, 3));
console.log('5 & 3 =', alu.AND(5, 3), '(binary:', alu.toBinary(alu.AND(5, 3)), ')');
console.log('5 << 1 =', alu.SHL(5, 1), '(binary:', alu.toBinary(alu.SHL(5, 1)), ')');
console.log('5 * 3 =', alu.multiply(5, 3));

export default BinaryALU;
