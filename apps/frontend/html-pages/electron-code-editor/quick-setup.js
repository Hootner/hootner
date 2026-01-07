/* global showPanel, addOutput, createFile, state, packageManager */

class QuickSetup { 
  constructor() { 
    this.templates = { 
      vanilla: { 
        name: 'Vanilla JavaScript',
        files: { 
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
          'script.js': 'console.log("Hello World");',
          'style.css': 'body { font-family: Arial, sans-serif; }' 
        }
      },
      react: { 
        name: 'React App',
        packages: ['react', 'react-dom'],
        files: { 
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>React App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script src="app.js"></script>\n</body>\n</html>',
          'app.js': 'import React from "react";\nimport ReactDOM from "react-dom";\n\nfunction App() {\n  return <h1>Hello React!</h1>;\n}\n\nReactDOM.render(<App />, document.getElementById("root"));' 
        }
      }
    }; 
  }

  showTemplates() { 
    try {
      const panel = document.getElementById('output');
      if (!panel) return;
      if (typeof showPanel === 'function') showPanel('output');
      panel.innerHTML = `<div style="padding:16px"><h3>🚀 Quick Setup</h3><p>Choose a template to get started</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">${Object.entries(this.templates).map(([key, template]) => 
        `<div class="template-card" onclick="quickSetup.createProject('${key}')"><h4>${template.name}</h4><p>${template.packages ? `Includes: ${template.packages.join(', ')}` : 'No dependencies'}</p></div>`
      ).join('')}</div></div>`;
    } catch (error) {
      console.error('Show templates failed:', error);
    }
  }

  async createProject(templateKey) { 
    try {
      const template = this.templates[templateKey];
      if (!template) return;
      const hasFiles = typeof state !== 'undefined' && state.fileSystem && Object.keys(state.fileSystem).length > 0;
      if (hasFiles && !window.confirm('This will replace existing files. Continue?')) return;
      if (template.packages && typeof packageManager !== 'undefined') { 
        for (const pkg of template.packages) { 
          await packageManager.installPackage(pkg); 
        }
      }
      Object.entries(template.files).forEach(([filename, content]) => { 
        if (typeof createFile === 'function') createFile(filename, content); 
      });
      if (typeof addOutput === 'function') addOutput(`🚀 Created ${template.name} project`, 'success');
      this.showTemplates();
    } catch (error) {
      console.error('Create project failed:', error);
      if (typeof addOutput === 'function') addOutput('❌ Project creation failed', 'error');
    }
  }

  async addFramework(framework) { 
    try {
      const frameworks = { 
        react: ['react', 'react-dom'],
        vue: ['vue'],
        express: ['express'],
        typescript: ['typescript', '@types/node'] 
      };
      const packages = frameworks[framework];
      if (!packages || typeof packageManager === 'undefined') return;
      for (const pkg of packages) { 
        await packageManager.installPackage(pkg); 
      }
      if (typeof addOutput === 'function') addOutput(`✓ Added ${framework}`, 'success');
    } catch (error) {
      console.error('Add framework failed:', error);
    }
  }

  async addTesting() { 
    try {
      if (typeof packageManager === 'undefined') return;
      await packageManager.installPackage('jest', 'latest', true);
      if (typeof createFile === 'function') {
        createFile('test.js', 'test("example test", () => {\n  expect(1 + 1).toBe(2);\n});');
      }
      if (typeof addOutput === 'function') addOutput('✓ Added Jest testing', 'success');
    } catch (error) {
      console.error('Add testing failed:', error);
    }
  }

  async addLinting() { 
    try {
      if (typeof packageManager === 'undefined') return;
      await packageManager.installPackage('eslint', 'latest', true);
      await packageManager.installPackage('prettier', 'latest', true);
      if (typeof createFile === 'function') {
        createFile('.eslintrc.json', '{\n  "env": {\n    "browser": true,\n    "es2021": true\n  },\n  "extends": "eslint:recommended"\n}');
        createFile('.prettierrc', '{\n  "semi": true,\n  "singleQuote": true\n}');
      }
      if (typeof addOutput === 'function') addOutput('✓ Added ESLint + Prettier', 'success');
    } catch (error) {
      console.error('Add linting failed:', error);
    }
  }
}

window.quickSetup = new QuickSetup();

if (typeof module !== 'undefined' && module.exports) { module.exports = QuickSetup; }
