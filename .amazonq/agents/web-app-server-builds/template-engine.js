class TemplateEngine {
    constructor(template) {
        this.template = template;
    }
    
    render(data) {
        let result = this.template;
        
        // Replace {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });
        
        // Handle {{#if condition}}...{{/if}}
        result = result.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, key, content) => {
            return data[key] ? content : '';
        });
        
        // Handle {{#each array}}...{{/each}}
        result = result.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, key, content) => {
            if (!Array.isArray(data[key])) return '';
            return data[key].map(item => {
                return content.replace(/\{\{this\}\}/g, item);
            }).join('');
        });
        
        return result;
    }
}

// Test
const template = `
<h1>{{title}}</h1>
{{#if showContent}}
<p>{{content}}</p>
{{/if}}
<ul>
{{#each items}}
  <li>{{this}}</li>
{{/each}}
</ul>
`;

const engine = new TemplateEngine(template);
const html = engine.render({
    title: 'My Page',
    showContent: true,
    content: 'Hello World',
    items: ['Item 1', 'Item 2', 'Item 3']
});

console.log(html);
