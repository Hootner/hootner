// Minimal Encryption (XOR cipher)
class Encryption {
  encrypt(text, key) {
    return text.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  }

  decrypt(cipher, key) {
    return this.encrypt(cipher, key);
  }
}

const enc = new Encryption();
const cipher = enc.encrypt('Hello', 'key');
console.log('Encrypted:', cipher);
console.log('Decrypted:', enc.decrypt(cipher, 'key'));

export default Encryption;
