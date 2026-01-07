class DOMNode {
    constructor(type, tag = null) {
        this.type = type;
        this.tag = tag;
        this.children = [];
        this.attributes = {};
        this.textContent = '';
        this.parent = null;
    }
    
    appendChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
    }
    
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    
    getAttribute(name) {
        return this.attributes[name];
    }
    
    getElementById(id) {
        if (this.attributes.id === id) return this;
        for (let child of this.children) {
            const found = child.getElementById(id);
            if (found) return found;
        }
        return null;
    }
    
    getElementsByTagName(tag) {
        const results = [];
        if (this.tag === tag) results.push(this);
        for (let child of this.children) {
            results.push(...child.getElementsByTagName(tag));
        }
        return results;
    }
    
    toString(indent = 0) {
        const spaces = '  '.repeat(indent);
        if (this.type === 'text') {
            return `${spaces}${this.textContent}`;
        }
        
        let str = `${spaces}<${this.tag}`;
        for (let [key, val] of Object.entries(this.attributes)) {
            str += ` ${key}="${val}"`;
        }
        str += '>\n';
        
        for (let child of this.children) {
            str += child.toString(indent + 1) + '\n';
        }
        
        str += `${spaces}</${this.tag}>`;
        return str;
    }
}

// Test
const doc = new DOMNode('element', 'html');
const body = new DOMNode('element', 'body');
body.setAttribute('id', 'main');

const h1 = new DOMNode('element', 'h1');
const text = new DOMNode('text');
text.textContent = 'Hello DOM!';
h1.appendChild(text);

body.appendChild(h1);
doc.appendChild(body);

console.log(doc.toString());
console.log('\nFind by ID:', doc.getElementById('main').tag);
