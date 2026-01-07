#!/usr/bin/env node
/**
 * Layer 7: Template Engine - HTML template rendering
 * Dependencies: Layer 2 (Parser), Layer 7 (Web Framework)
 */

class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.partials = new Map();
    this.helpers = new Map();
  }

  // Register template
  register(name, template) {
    this.templates.set(name, template);
    console.log(`[TEMPLATE] Registered ${name}`);
  }

  // Register partial
  partial(name, template) {
    this.partials.set(name, template);
    console.log(`[PARTIAL] Registered ${name}`);
  }

  // Register helper
  helper(name, fn) {
    this.helpers.set(name, fn);
  }

  // Render template
  render(name, data = {}) {
    const template = this.templates.get(name);
    if (!template) throw new Error(`Template ${name} not found`);
    
    console.log(`[RENDER] ${name}`);
    return this.compile(template, data);
  }

  // Compile template
  compile(template, data) {
    let output = template;
    
    // Variables: {{ variable }}
    output = output.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : '';
    });
    
    // Nested variables: {{ user.name }}
    output = output.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? value : '';
    });
    
    // Conditionals: {% if condition %} ... {% endif %}
    output = this.processConditionals(output, data);
    
    // Loops: {% for item in items %} ... {% endfor %}
    output = this.processLoops(output, data);
    
    // Partials: {% include partial %}
    output = this.processPartials(output, data);
    
    // Helpers: {{ helper(arg) }}
    output = this.processHelpers(output, data);
    
    return output;
  }

  // Process conditionals
  processConditionals(template, data) {
    const regex = /\{%\s*if\s+(\w+)\s*%\}(.*?)\{%\s*endif\s*%\}/gs;
    
    return template.replace(regex, (match, condition, content) => {
      return data[condition] ? content : '';
    });
  }

  // Process loops
  processLoops(template, data) {
    const regex = /\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}(.*?)\{%\s*endfor\s*%\}/gs;
    
    return template.replace(regex, (match, itemVar, arrayVar, content) => {
      const array = data[arrayVar];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        const itemData = { ...data, [itemVar]: item };
        return this.compile(content, itemData);
      }).join('');
    });
  }

  // Process partials
  processPartials(template, data) {
    const regex = /\{%\s*include\s+(\w+)\s*%\}/g;
    
    return template.replace(regex, (match, partialName) => {
      const partial = this.partials.get(partialName);
      return partial ? this.compile(partial, data) : '';
    });
  }

  // Process helpers
  processHelpers(template, data) {
    const regex = /\{\{\s*(\w+)\((.*?)\)\s*\}\}/g;
    
    return template.replace(regex, (match, helperName, args) => {
      const helper = this.helpers.get(helperName);
      if (!helper) return '';
      
      const argValues = args.split(',').map(arg => {
        arg = arg.trim();
        return arg.startsWith('"') ? arg.slice(1, -1) : data[arg];
      });
      
      return helper(...argValues);
    });
  }

  // Get nested value
  getNestedValue(obj, path) {
    return path.split('.').reduce((val, key) => val?.[key], obj);
  }
}

// Demo
if (require.main === module) {
  const engine = new TemplateEngine();
  
  console.log('=== Template Engine Demo ===\n');
  
  // Register helpers
  engine.helper('uppercase', (str) => str.toUpperCase());
  engine.helper('date', (timestamp) => new Date(timestamp).toLocaleDateString());
  
  // Register partial
  engine.partial('header', '<header><h1>{{ title }}</h1></header>');
  
  // Register templates
  engine.register('home', `
{% include header %}
<main>
  <p>Welcome, {{ user.name }}!</p>
  {% if isAdmin %}
  <p>Admin Panel</p>
  {% endif %}
  <ul>
  {% for item in items %}
    <li>{{ item.name }} - {{ uppercase(item.status) }}</li>
  {% endfor %}
  </ul>
</main>
  `.trim());
  
  console.log();
  
  // Render
  const html = engine.render('home', {
    title: 'My Site',
    user: { name: 'Alice' },
    isAdmin: true,
    items: [
      { name: 'Task 1', status: 'done' },
      { name: 'Task 2', status: 'pending' }
    ]
  });
  
  console.log('\nRendered HTML:');
  console.log(html);
}

module.exports = TemplateEngine;
