class JSEngine {
    constructor() {
        this.globals = {
            console: {
                log: (...args) => console.log('[JS]', ...args)
            }
        };
    }
    
    eval(code) {
        const tokens = this.tokenize(code);
        return this.execute(tokens);
    }
    
    tokenize(code) {
        const tokens = [];
        let i = 0;
        
        while (i < code.length) {
            if (/\s/.test(code[i])) {
                i++;
                continue;
            }
            
            if (/[a-zA-Z_]/.test(code[i])) {
                let word = '';
                while (i < code.length && /[a-zA-Z0-9_.]/.test(code[i])) {
                    word += code[i++];
                }
                tokens.push({ type: 'identifier', value: word });
            } else if (/\d/.test(code[i])) {
                let num = '';
                while (i < code.length && /\d/.test(code[i])) {
                    num += code[i++];
                }
                tokens.push({ type: 'number', value: parseInt(num) });
            } else if (code[i] === '(') {
                tokens.push({ type: 'lparen' });
                i++;
            } else if (code[i] === ')') {
                tokens.push({ type: 'rparen' });
                i++;
            } else if (code[i] === ',') {
                tokens.push({ type: 'comma' });
                i++;
            } else if (code[i] === '"' || code[i] === "'") {
                const quote = code[i++];
                let str = '';
                while (i < code.length && code[i] !== quote) {
                    str += code[i++];
                }
                i++;
                tokens.push({ type: 'string', value: str });
            } else {
                i++;
            }
        }
        
        return tokens;
    }
    
    execute(tokens) {
        let i = 0;
        
        while (i < tokens.length) {
            if (tokens[i].type === 'identifier' && tokens[i + 1]?.type === 'lparen') {
                const funcPath = tokens[i].value.split('.');
                let func = this.globals;
                for (let part of funcPath) {
                    func = func[part];
                }
                
                i += 2; // Skip identifier and lparen
                const args = [];
                
                while (tokens[i]?.type !== 'rparen') {
                    if (tokens[i].type === 'string' || tokens[i].type === 'number') {
                        args.push(tokens[i].value);
                    }
                    i++;
                }
                
                func(...args);
                i++; // Skip rparen
            } else {
                i++;
            }
        }
    }
}

// Test
const engine = new JSEngine();
engine.eval('console.log("Hello from JS Engine!")');
engine.eval('console.log(42)');
