#!/usr/bin/env node
/**
 * Layer 8: Rendering Engine - Browser rendering pipeline
 * Dependencies: Layer 2 (Parser), Layer 7 (HTTP Client)
 */

class RenderingEngine {
  constructor() {
    this.dom = null;
    this.cssom = null;
    this.renderTree = null;
  }

  // Parse HTML to DOM
  parseHTML(html) {
    const dom = { type: 'document', children: [] };
    const stack = [dom];
    
    const tagRegex = /<(\/?)([\w-]+)([^>]*)>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
      const [fullMatch, closing, tagName, attrs] = match;
      
      // Text before tag
      if (match.index > lastIndex) {
        const text = html.slice(lastIndex, match.index).trim();
        if (text) {
          stack[stack.length - 1].children.push({ type: 'text', content: text });
        }
      }
      
      if (closing) {
        // Closing tag
        stack.pop();
      } else {
        // Opening tag
        const node = {
          type: 'element',
          tag: tagName,
          attributes: this.parseAttributes(attrs),
          children: []
        };
        stack[stack.length - 1].children.push(node);
        
        // Self-closing tags
        if (!['img', 'br', 'hr', 'input'].includes(tagName)) {
          stack.push(node);
        }
      }
      
      lastIndex = tagRegex.lastIndex;
    }
    
    console.log('[DOM] Parsed HTML');
    this.dom = dom;
    return dom;
  }

  // Parse attributes
  parseAttributes(attrStr) {
    const attrs = {};
    const attrRegex = /([\w-]+)="([^"]*)"/g;
    let match;
    
    while ((match = attrRegex.exec(attrStr)) !== null) {
      attrs[match[1]] = match[2];
    }
    
    return attrs;
  }

  // Parse CSS
  parseCSS(css) {
    const rules = [];
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = {};
      
      const declRegex = /([\w-]+):\s*([^;]+)/g;
      let declMatch;
      
      while ((declMatch = declRegex.exec(match[2])) !== null) {
        declarations[declMatch[1].trim()] = declMatch[2].trim();
      }
      
      rules.push({ selector, declarations });
    }
    
    console.log('[CSSOM] Parsed CSS');
    this.cssom = rules;
    return rules;
  }

  // Build render tree
  buildRenderTree() {
    if (!this.dom || !this.cssom) return null;
    
    const renderTree = this.buildRenderNode(this.dom);
    
    console.log('[RENDER TREE] Built');
    this.renderTree = renderTree;
    return renderTree;
  }

  // Build render node
  buildRenderNode(node) {
    if (node.type === 'text') {
      return { type: 'text', content: node.content, style: {} };
    }
    
    if (node.type === 'element') {
      const style = this.computeStyle(node);
      
      // Skip if display: none
      if (style.display === 'none') return null;
      
      const renderNode = {
        type: 'element',
        tag: node.tag,
        style,
        children: []
      };
      
      for (const child of node.children || []) {
        const childRender = this.buildRenderNode(child);
        if (childRender) renderNode.children.push(childRender);
      }
      
      return renderNode;
    }
    
    // Document node
    const children = [];
    for (const child of node.children || []) {
      const childRender = this.buildRenderNode(child);
      if (childRender) children.push(childRender);
    }
    
    return { type: 'document', children };
  }

  // Compute style
  computeStyle(node) {
    const style = {};
    
    // Apply CSS rules
    for (const rule of this.cssom || []) {
      if (this.matchSelector(node, rule.selector)) {
        Object.assign(style, rule.declarations);
      }
    }
    
    // Inline styles
    if (node.attributes?.style) {
      const inlineStyles = node.attributes.style.split(';');
      for (const decl of inlineStyles) {
        const [prop, value] = decl.split(':').map(s => s.trim());
        if (prop && value) style[prop] = value;
      }
    }
    
    return style;
  }

  // Match selector (simplified)
  matchSelector(node, selector) {
    if (selector === '*') return true;
    if (selector.startsWith('.')) {
      return node.attributes?.class?.includes(selector.slice(1));
    }
    if (selector.startsWith('#')) {
      return node.attributes?.id === selector.slice(1);
    }
    return node.tag === selector;
  }

  // Layout (simplified box model)
  layout() {
    if (!this.renderTree) return null;
    
    const layoutTree = this.layoutNode(this.renderTree, { x: 0, y: 0, width: 800 });
    
    console.log('[LAYOUT] Computed');
    return layoutTree;
  }

  // Layout node
  layoutNode(node, parent) {
    if (node.type === 'text') {
      return {
        ...node,
        box: { x: parent.x, y: parent.y, width: node.content.length * 8, height: 16 }
      };
    }
    
    const box = {
      x: parent.x,
      y: parent.y,
      width: parseInt(node.style?.width) || parent.width,
      height: parseInt(node.style?.height) || 0
    };
    
    let currentY = box.y;
    const children = [];
    
    for (const child of node.children || []) {
      const childLayout = this.layoutNode(child, { ...box, y: currentY });
      children.push(childLayout);
      currentY += childLayout.box?.height || 0;
    }
    
    box.height = box.height || (currentY - box.y);
    
    return { ...node, box, children };
  }

  // Paint (simplified)
  paint(layoutTree) {
    console.log('[PAINT] Rendering');
    const commands = [];
    this.paintNode(layoutTree, commands);
    return commands;
  }

  // Paint node
  paintNode(node, commands) {
    if (node.type === 'text') {
      commands.push({
        type: 'text',
        content: node.content,
        x: node.box.x,
        y: node.box.y
      });
      return;
    }
    
    if (node.box) {
      // Background
      if (node.style?.['background-color']) {
        commands.push({
          type: 'rect',
          x: node.box.x,
          y: node.box.y,
          width: node.box.width,
          height: node.box.height,
          fill: node.style['background-color']
        });
      }
    }
    
    for (const child of node.children || []) {
      this.paintNode(child, commands);
    }
  }

  // Full render pipeline
  render(html, css) {
    this.parseHTML(html);
    this.parseCSS(css);
    this.buildRenderTree();
    const layoutTree = this.layout();
    const paintCommands = this.paint(layoutTree);
    
    console.log(`[RENDER] Complete - ${paintCommands.length} paint commands`);
    return paintCommands;
  }
}

// Demo
if (require.main === module) {
  const engine = new RenderingEngine();
  
  console.log('=== Rendering Engine Demo ===\n');
  
  const html = `
    <div id="container" class="main">
      <h1>Hello World</h1>
      <p style="color: blue">This is a paragraph</p>
    </div>
  `;
  
  const css = `
    .main { background-color: #f0f0f0; width: 600px; }
    h1 { color: red; }
    p { font-size: 14px; }
  `;
  
  const commands = engine.render(html, css);
  
  console.log('\nPaint Commands:', commands.slice(0, 3));
}

module.exports = RenderingEngine;
