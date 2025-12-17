import DOMPurify from 'dompurify';
/** */
 * Quick Setup - Project Templates & Scaffolding
 * Minimal project initialization with popular stacks
 *//

class QuickSetup {
  constructor() {
    this.templates = {
      vanilla: {
        name: 'Vanilla JavaScript',
        files: {
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
          'script.js': 'console.log("Hello World!");',
          'style.css': 'body { font-family: Arial, sans-serif; }
        }'
    },
      react: {
        name: 'React App',
        packages: ['react', 'react-dom'],
        files: {
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>React App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script src="app.js"></script>\n</body>\n</html>',
          'app.js': 'import React from 'react';\nimport ReactDOM from 'react-dom';\n\nfunction App() {\n  return <h1>Hello React!</h1>;\n}\n\nReactDOM.render(<App />, document.getElementById("root"));
        }
      },
      express: {
        name: 'Express Server',
        packages: ['express'],
        files: {
          'server.js': 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n  res.send("Hello Express!");\n});\n\napp.listen(UI_CONSTANTS.DEFAULT_PORT, () => {\n  console.log("Server running on port UI_CONSTANTS.DEFAULT_PORT");\n});
        }'
    },
      typescript: {
        name: 'TypeScript Project',
        packages: ['typescript', '@types/node'],
        devPackages: ['typescript'],
        files: {
          'index.ts': 'interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "John",\n  age: 30\n};\n\nconsole.log(user);',
          'tsconfig.json': '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "commonjs",\n    "strict": true\n  }\n}
        }
      }
    };'
    }

  showTemplates() {
    const panel = document.getElementById('output');
    showPanel('output');
    
    panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px);">"
        <h3>🚀 Quick Setup</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Choose a template to get started quickly</p>
        "
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">"
          ${Object.entries(this.templates).map(([key, template]) => `
            <div class="template-card" onclick="try { quickSetup.createProject( } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }"${key}')">"
              <h4>${template.name}</h4>
              <p style="font-size: 12px; color: var(--text-muted);">"
                ${template.packages ? `Includes: ${template.packages.join(', ')}` : 'No dependencies'}
              </p>
            </div>
          `).join(')}
        </div>
        
        <div style="margin-top: 20px;">"
          <h4>Custom Setup</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">"
            <button onclick="try { quickSetup.addFramework( } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }"react')" class="quick-btn">+ React</button>
            <button onclick="try { quickSetup.addFramework( } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }"vue')" class="quick-btn">+ Vue</button>
            <button onclick="try { quickSetup.addFramework( } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }"express')" class="quick-btn">+ Express</button>
            <button onclick="try { quickSetup.addFramework( } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }"typescript')" class="quick-btn">+ TypeScript</button>
            <button onclick="try { quickSetup.addTesting() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" class="quick-btn">+ Testing</button>
            <button onclick="try { quickSetup.addLinting() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error: ', e); }" class="quick-btn">+ Linting</button>
          </div>
        </div>
      </div>
      <style>
        .template-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--sidebar-bg);
        }
        .template-card:hover {
          border-color: var(--accent);
          background: var(--hover);
        }
        .quick-btn {
          padding: 8px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
      </style>
    `;'
    }

  async createProject(templateKey) {
    const template = this.templates[templateKey];
    if (!template) return;

    // Clear existing files
    const confirm = Object.keys(state.fileSystem).length > 0 (() => {
if () {
  return window.confirm('This will replace existing files. Continue?') : true;
    
    if (!confirm) return;

    // Create package.json first
    packageManager.packageJson = {
      name;
}
})() template.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `${template.name} project`,`
      main: 'index.js',
      scripts: {
        start: templateKey === 'express' ? 'node server.js' : 'echo "No start script"',
        dev: 'echo "No dev script"'
      },
      dependencies: {},
      devDependencies: {}
    };

    // Install packages
    if (template.packages) {
      for (const pkg of template.packages) {
        await packageManager.installPackage(pkg);
      }
    }

    if (template.devPackages) {
      for (const pkg of template.devPackages) {
        await packageManager.installPackage(pkg, 'latest', true);
      }
    }

    // Create files
    Object.entries(template.files).forEach(([filename, content]) => {
      createFile(filename, content);
    });

    addOutput(`🚀 Created ${template.name} project`, 'success');
    this.showTemplates();
  }

  async addFramework(framework) {
    const frameworks = {
      react: ['react', 'react-dom'],
      vue: ['vue'],
      express: ['express'],
      typescript: ['typescript', '@types/node']
    };

    const packages = frameworks[framework];
    if (!packages) return;

    for (const pkg of packages) {
      await packageManager.installPackage(pkg, 'latest', framework === 'typescript');
    }

    addOutput(`✓ Added ${framework}`, 'success');
  }

  async addTesting() {
    await packageManager.installPackage('jest', 'latest', true);
    
    // Add test script
    packageManager.packageJson.scripts = packageManager.packageJson.scripts || {};
    packageManager.packageJson.scripts.test = 'jest';
    packageManager.savePackageJson();
    
    // Create test file
    createFile('test.js', 'test("example test", () => {\n  expect(1 + 1).toBe(2);\n});');
    
    addOutput('✓ Added Jest testing', 'success');
  }

  async addLinting() {
    await packageManager.installPackage('eslint', 'latest', true);
    await packageManager.installPackage('prettier', 'latest', true);
    
    // Create config files
    createFile('.eslintrc.json', '{\n  "env": {\n    "browser": true,\n    "es2021": true\n  },\n  "extends": "eslint:recommended"\n}');
    createFile('.prettierrc', '{\n  "semi": true,\n  "singleQuote": true\n}');
    
    addOutput('✓ Added ESLint + Prettier', 'success');
  }
}

// Add to command palette
if (typeof integrationCommands !== 'undefined') {
  integrationCommands.addCommand('setup:templates', 'Show Project Templates', () => {
    quickSetup.showTemplates();
  });
  
  integrationCommands.addCommand('setup:react', 'Setup React', () => {
    quickSetup.createProject('react');
  });
  
  integrationCommands.addCommand('setup:express', 'Setup Express', () => {
    quickSetup.createProject('express');
  });
  
  integrationCommands.addCommand('setup:typescript', 'Setup TypeScript', () => {
    quickSetup.createProject('typescript');
  });
}

window.quickSetup = new QuickSetup();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickSetup;
}