class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;
        this.props = props;
        this.children = children;
    }
}

function h(tag, props, ...children) {
    return new VNode(tag, props, children.flat());
}

function render(vnode) {
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }
    
    const el = document.createElement(vnode.tag);
    
    for (let [key, value] of Object.entries(vnode.props || {})) {
        el.setAttribute(key, value);
    }
    
    for (let child of vnode.children) {
        el.appendChild(render(child));
    }
    
    return el;
}

function diff(oldVNode, newVNode) {
    if (!oldVNode) return { type: 'CREATE', newVNode };
    if (!newVNode) return { type: 'REMOVE' };
    if (typeof oldVNode !== typeof newVNode || oldVNode.tag !== newVNode.tag) {
        return { type: 'REPLACE', newVNode };
    }
    if (typeof oldVNode === 'string') {
        if (oldVNode !== newVNode) {
            return { type: 'TEXT', newVNode };
        }
        return null;
    }
    
    const patches = [];
    const childPatches = [];
    const maxLen = Math.max(oldVNode.children.length, newVNode.children.length);
    
    for (let i = 0; i < maxLen; i++) {
        childPatches.push(diff(oldVNode.children[i], newVNode.children[i]));
    }
    
    return { type: 'UPDATE', childPatches };
}

// Test
const vdom1 = h('div', { id: 'app' },
    h('h1', {}, 'Hello'),
    h('p', {}, 'World')
);

const vdom2 = h('div', { id: 'app' },
    h('h1', {}, 'Hello'),
    h('p', {}, 'Updated World')
);

console.log('VNode 1:', JSON.stringify(vdom1, null, 2));
console.log('\nDiff:', JSON.stringify(diff(vdom1, vdom2), null, 2));
