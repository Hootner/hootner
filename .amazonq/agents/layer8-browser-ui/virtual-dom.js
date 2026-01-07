#!/usr/bin/env node
/**
 * Layer 8: Virtual DOM - Efficient DOM updates with diffing
 * Dependencies: Layer 0 (Logic), Layer 8 (Rendering Engine)
 */

class VirtualDOM {
  constructor() {
    this.vdom = null;
    this.patches = [];
  }

  // Create virtual node
  h(tag, props = {}, ...children) {
    return {
      tag,
      props,
      children: children.flat().map(child =>
        typeof child === 'string' ? { tag: 'text', props: {}, text: child } : child
      )
    };
  }

  // Diff two virtual trees
  diff(oldNode, newNode, index = 0) {
    const patches = [];
    
    // Node removed
    if (!newNode) {
      patches.push({ type: 'REMOVE', index });
      return patches;
    }
    
    // Node added
    if (!oldNode) {
      patches.push({ type: 'CREATE', index, node: newNode });
      return patches;
    }
    
    // Text changed
    if (oldNode.tag === 'text' && newNode.tag === 'text') {
      if (oldNode.text !== newNode.text) {
        patches.push({ type: 'TEXT', index, text: newNode.text });
      }
      return patches;
    }
    
    // Tag changed
    if (oldNode.tag !== newNode.tag) {
      patches.push({ type: 'REPLACE', index, node: newNode });
      return patches;
    }
    
    // Props changed
    const propPatches = this.diffProps(oldNode.props, newNode.props);
    if (propPatches.length > 0) {
      patches.push({ type: 'PROPS', index, props: propPatches });
    }
    
    // Diff children
    const childPatches = this.diffChildren(oldNode.children, newNode.children, index);
    patches.push(...childPatches);
    
    return patches;
  }

  // Diff props
  diffProps(oldProps, newProps) {
    const patches = [];
    
    // Changed or added props
    for (const [key, value] of Object.entries(newProps)) {
      if (oldProps[key] !== value) {
        patches.push({ type: 'SET_PROP', key, value });
      }
    }
    
    // Removed props
    for (const key of Object.keys(oldProps)) {
      if (!(key in newProps)) {
        patches.push({ type: 'REMOVE_PROP', key });
      }
    }
    
    return patches;
  }

  // Diff children
  diffChildren(oldChildren, newChildren, parentIndex) {
    const patches = [];
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    
    for (let i = 0; i < maxLen; i++) {
      const childIndex = parentIndex * 1000 + i; // Simple indexing
      const childPatches = this.diff(oldChildren[i], newChildren[i], childIndex);
      patches.push(...childPatches);
    }
    
    return patches;
  }

  // Apply patches to real DOM (simulated)
  patch(rootNode, patches) {
    console.log(`[PATCH] Applying ${patches.length} patches`);
    
    for (const patch of patches) {
      switch (patch.type) {
        case 'CREATE':
          console.log(`  CREATE node at ${patch.index}`);
          break;
        case 'REMOVE':
          console.log(`  REMOVE node at ${patch.index}`);
          break;
        case 'REPLACE':
          console.log(`  REPLACE node at ${patch.index}`);
          break;
        case 'TEXT':
          console.log(`  TEXT update at ${patch.index}: "${patch.text}"`);
          break;
        case 'PROPS':
          console.log(`  PROPS update at ${patch.index}: ${patch.props.length} changes`);
          break;
      }
    }
    
    this.patches = patches;
    return patches.length;
  }

  // Render virtual tree
  render(vnode) {
    this.vdom = vnode;
    console.log('[RENDER] Initial render');
    return vnode;
  }

  // Update with new tree
  update(newVNode) {
    const patches = this.diff(this.vdom, newVNode);
    this.patch(null, patches);
    this.vdom = newVNode;
    return patches;
  }

  // Component system
  component(render) {
    return {
      state: {},
      setState(newState) {
        this.state = { ...this.state, ...newState };
        const newVNode = render(this.state);
        // Trigger re-render
        return newVNode;
      },
      render() {
        return render(this.state);
      }
    };
  }

  // Key-based reconciliation
  reconcile(oldChildren, newChildren) {
    const oldKeys = new Map();
    const newKeys = new Map();
    
    oldChildren.forEach((child, i) => {
      if (child.props?.key) oldKeys.set(child.props.key, { child, index: i });
    });
    
    newChildren.forEach((child, i) => {
      if (child.props?.key) newKeys.set(child.props.key, { child, index: i });
    });
    
    const moves = [];
    
    // Find moves
    for (const [key, { child, index }] of newKeys) {
      const old = oldKeys.get(key);
      if (old && old.index !== index) {
        moves.push({ type: 'MOVE', key, from: old.index, to: index });
      }
    }
    
    console.log(`[RECONCILE] ${moves.length} moves`);
    return moves;
  }
}

// Demo
if (require.main === module) {
  const vdom = new VirtualDOM();
  
  console.log('=== Virtual DOM Demo ===\n');
  
  // Create virtual tree
  const tree1 = vdom.h('div', { id: 'app' },
    vdom.h('h1', {}, 'Hello'),
    vdom.h('p', {}, 'World')
  );
  
  console.log('Initial tree:', JSON.stringify(tree1, null, 2).slice(0, 150) + '...\n');
  
  // Render
  vdom.render(tree1);
  
  console.log();
  
  // Update tree
  const tree2 = vdom.h('div', { id: 'app' },
    vdom.h('h1', {}, 'Hello'),
    vdom.h('p', {}, 'Updated World'),
    vdom.h('span', {}, 'New element')
  );
  
  const patches = vdom.update(tree2);
  
  console.log(`\nTotal patches: ${patches.length}`);
  
  // Component demo
  console.log('\n--- Component Demo ---\n');
  
  const Counter = vdom.component((state) => {
    return vdom.h('div', {},
      vdom.h('p', {}, `Count: ${state.count || 0}`),
      vdom.h('button', { onclick: 'increment' }, 'Increment')
    );
  });
  
  Counter.state = { count: 0 };
  const view1 = Counter.render();
  console.log('Counter initial:', view1.children[0].text);
  
  Counter.setState({ count: 1 });
  const view2 = Counter.render();
  console.log('Counter updated:', view2.children[0].text);
}

module.exports = VirtualDOM;
