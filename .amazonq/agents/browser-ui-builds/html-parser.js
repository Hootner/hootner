class HTMLParser {
    constructor(html) {
        this.html = html;
        this.pos = 0;
    }
    
    parse() {
        const nodes = [];
        while (this.pos < this.html.length) {
            if (this.html[this.pos] === '<') {
                const node = this.parseTag();
                if (node) nodes.push(node);
            } else {
                const text = this.parseText();
                if (text.trim()) nodes.push({ type: 'text', content: text });
            }
        }
        return nodes;
    }
    
    parseTag() {
        this.pos++; // Skip <
        
        if (this.html[this.pos] === '/') {
            // Closing tag
            while (this.html[this.pos] !== '>') this.pos++;
            this.pos++;
            return null;
        }
        
        let tagName = '';
        while (this.html[this.pos] !== '>' && this.html[this.pos] !== ' ') {
            tagName += this.html[this.pos++];
        }
        
        while (this.html[this.pos] !== '>') this.pos++;
        this.pos++; // Skip >
        
        const children = [];
        const startPos = this.pos;
        
        while (this.pos < this.html.length && 
               !this.html.substring(this.pos).startsWith(`</${tagName}>`)) {
            if (this.html[this.pos] === '<' && this.html[this.pos + 1] !== '/') {
                const child = this.parseTag();
                if (child) children.push(child);
            } else {
                const text = this.parseText();
                if (text.trim()) children.push({ type: 'text', content: text });
            }
        }
        
        if (this.html.substring(this.pos).startsWith(`</${tagName}>`)) {
            this.pos += tagName.length + 3;
        }
        
        return { type: 'element', tag: tagName, children };
    }
    
    parseText() {
        let text = '';
        while (this.pos < this.html.length && this.html[this.pos] !== '<') {
            text += this.html[this.pos++];
        }
        return text;
    }
}

// Test
const html = '<div><h1>Title</h1><p>Content</p></div>';
const parser = new HTMLParser(html);
console.log(JSON.stringify(parser.parse(), null, 2));
