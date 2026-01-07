class CSSParser {
    constructor(css) {
        this.css = css.replace(/\s+/g, ' ').trim();
    }
    
    parse() {
        const rules = [];
        let pos = 0;
        
        while (pos < this.css.length) {
            const selectorEnd = this.css.indexOf('{', pos);
            if (selectorEnd === -1) break;
            
            const selector = this.css.substring(pos, selectorEnd).trim();
            const blockStart = selectorEnd + 1;
            const blockEnd = this.css.indexOf('}', blockStart);
            
            const declarations = this.parseDeclarations(
                this.css.substring(blockStart, blockEnd)
            );
            
            rules.push({ selector, declarations });
            pos = blockEnd + 1;
        }
        
        return rules;
    }
    
    parseDeclarations(block) {
        const declarations = {};
        const parts = block.split(';').filter(p => p.trim());
        
        parts.forEach(part => {
            const [property, value] = part.split(':').map(s => s.trim());
            if (property && value) {
                declarations[property] = value;
            }
        });
        
        return declarations;
    }
}

// Test
const css = `
    body { margin: 0; padding: 0; }
    .container { width: 100%; max-width: 1200px; }
    #header { background: blue; color: white; }
`;

const parser = new CSSParser(css);
console.log(JSON.stringify(parser.parse(), null, 2));
