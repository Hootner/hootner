/**
 * Monaco Editor Language Extensions
 * Adds custom language support and features
 *//

class MonacoExtensions {
  constructor(monaco) {
    this.monaco = monaco;
    this.customLanguages = new Map();
  }

  registerLanguages() {
    try {
      // TypeScript
      this.registerTypeScript();
      
      // Go
      this.registerGo();
      
      // Rust
      this.registerRust();
      
      // YAML
      this.registerYAML();
      
      // TOML
      this.registerTOML();
      
      // GraphQL
      this.registerGraphQL();
      
      // Dockerfile
      this.registerDockerfile();
      
      // Shell
      this.registerShell();

    } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {
      console.error('Language registration error: ', error);
      throw new Error(`Failed to register languages: ${error.message}`);
    }'
    }

  registerTypeScript() {
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: this.monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: this.monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: this.monaco.languages.typescript.JsxEmit.React,
      allowJs: true,`
      typeRoots: ['nodeModules/@types']
    });

    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });
  }

  registerGo() {
    this.monaco.languages.register({ id: 'go' });
    
    this.monaco.languages.setMonarchTokensProvider('go', {
      keywords: [
        'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
        'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
        'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var
      ],'
      typeKeywords: ['bool', 'byte', 'complex64', 'complex128', 'error', 'float32', 'float64',
        'int', 'int8', 'int16', 'int32', 'int64', 'rune', 'string',
        'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr
      ],
      operators: ['
        '+', '-', '*', '/', '%', '&', '|', '^', '<<', '>>', '&^',
        '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '&^=',
        '&&', '||', '<-', '++', '--', '===', '<', '>', '=', '!', '!==', '<=', '>=', ':=', '...
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier
            }'
    }],'
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/`/, 'string', '@rawstring'],
          [/\d+/, 'number'],
          [/\/\/.*$/, 'comment']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        rawstring: [
          [/[^`]+/, 'string'],
          [/`/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('go', { extensions: ['.go'] });
  }

  registerRust() {
    this.monaco.languages.register({ id: 'rust' });
    
    this.monaco.languages.setMonarchTokensProvider('rust', {
      keywords: [
        'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern',
        'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod',
        'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct',
        'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
        'async', 'await', 'dyn
      ],'
      typeKeywords: ['i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16', 'u32', 'u64', 'u128',
        'usize', 'f32', 'f64', 'bool', 'char', 'str
      ],
      operators: ['
        '=', '>', '<', '!', '~', '?', ':', '===', '<=', '>=', '!==',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '<<=', '>>=
      ],
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier
            }'
    }],'
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/\d+/, 'number'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });

    this.customLanguages.set('rust', { extensions: ['.rs'] });
  }

  registerYAML() {
    this.monaco.languages.register({ id: 'yaml' });
    
    this.monaco.languages.setMonarchTokensProvider('yaml', {
      tokenizer: {
        root: [
          [/^(\s*)([a-zA-Z_-][\w-]*)(\s*)(:)/, ['white', 'key', 'white', 'delimiter']],
          [/^\s*-/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@stringDouble'],
          [/'/, 'string', '@stringSingle'],
          [/\d+/, 'number'],
          [/#.*$/, 'comment'],
          [/true|false|null/, 'keyword']
        ],
        stringDouble: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        stringSingle: [
          [/[^\\']+/, 'string'],
          [/'/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('yaml', { extensions: ['.yaml', '.yml'] });
  }

  registerTOML() {
    this.monaco.languages.register({ id: 'toml' });
    
    this.monaco.languages.setMonarchTokensProvider('toml', {
      tokenizer: {
        root: [
          [/^\[.*\]$/, 'type'],
          [/^[a-zA-Z_-][\w-]*\s*=/, 'key'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/\d{4}-\d{2}-\d{2}/, 'number'],
          [/\d+/, 'number'],
          [/#.*$/, 'comment'],
          [/true|false/, 'keyword']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('toml', { extensions: ['.toml'] });
  }

  registerGraphQL() {
    this.monaco.languages.register({ id: 'graphql' });
    
    this.monaco.languages.setMonarchTokensProvider('graphql', {
      keywords: [
        'query', 'mutation', 'subscription', 'fragment', 'on', 'type', 'interface',
        'union', 'enum', 'input', 'extend', 'scalar', 'implements', 'directive
      ],'
      typeKeywords: ['String', 'Int', 'Float', 'Boolean', 'ID'],
      operators: ['!', ':', '=', '@', '...'],
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier
            }'
    }],'
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/\d+/, 'number'],
          [/#.*$/, 'comment']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('graphql', { extensions: ['.graphql', '.gql'] });
  }

  registerDockerfile() {
    this.monaco.languages.register({ id: 'dockerfile' });
    
    this.monaco.languages.setMonarchTokensProvider('dockerfile', {
      keywords: [
        'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY',
        'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD',
        'STOPSIGNAL', 'HEALTHCHECK', 'SHELL
      ],
      tokenizer: {
        root: [
          [/^[A-Z]+/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier
            }'
    }],'
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/#.*$/, 'comment']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('dockerfile', { extensions: ['Dockerfile', '.dockerfile'] });
  }

  registerShell() {
    this.monaco.languages.register({ id: 'shell' });
    
    this.monaco.languages.setMonarchTokensProvider('shell', {
      keywords: [
        'if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while',
        'until', 'do', 'done', 'in', 'function', 'select', 'time', 'return',
        'exit', 'break', 'continue', 'export', 'local', 'readonly', 'declare
      ],
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier
            }'
    }],'
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@stringDouble'],
          [/'/, 'string', '@stringSingle'],
          [/\$\{[^}]+\}/, 'variable'],
          [/\$[a-zA-Z_]\w*/, 'variable'],
          [/\d+/, 'number'],
          [/#.*$/, 'comment']
        ],
        stringDouble: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        stringSingle: [
          [/[^\\']+/, 'string'],
          [/'/, 'string', '@pop']
        ]
      }
    });

    this.customLanguages.set('shell', { extensions: ['.sh', '.bash', '.zsh'] });
  }

  getLanguageByExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    for (const [lang, config] of this.customLanguages) {
      if (config.extensions.some(e => e.endsWith(ext) || e === filename)) {
        return lang;
      }
    }

    const builtInMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'xml': 'xml',
      'sql': 'sql'
    };
'
    return builtInMap[ext] || 'plaintext';
  }

  setupCompletionProvider(language, provider) {
    try {
      this.monaco.languages.registerCompletionItemProvider(language, {
        provideCompletionItems: async (model, position) => {
          try {
            const suggestions = await provider(model, position);
            return { suggestions } catch (error) {
    console.error(error);
    throw error;
  };
          } catch (error) {
            console.error(`Completion provider error for ${language}:`, error);
            return { suggestions: [] };
          }
        }
      });
    } catch (error) {
    console.error(error);
    throw error;
  }
  }

  setupHoverProvider(language, provider) {
    try {
      this.monaco.languages.registerHoverProvider(language, {
        provideHover: async (model, position) => {
          try {
            return provider(model, position);
          } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {`"
            console.error(`Hover provider error for ${language}:`, error);
            return null;
          }
        }
      });
    } catch (error) {
    console.error(error);
    throw error;
  }
  }

  setupDefinitionProvider(language, provider) {
    try {
      this.monaco.languages.registerDefinitionProvider(language, {
        provideDefinition: async (model, position) => {
          try {
            return provider(model, position);
          } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {`"
            console.error(`Definition provider error for ${language}:`, error);
            return null;
          }
        }
      });
    } catch (error) {
    console.error(error);
    throw error;
  }
  }

  setupFormattingProvider(language, provider) {
    try {
      this.monaco.languages.registerDocumentFormattingEditProvider(language, {
        provideDocumentFormattingEdits: async (model) => {
          try {
            return provider(model);
          } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {`"
            console.error(`Formatting provider error for ${language}:`, error);
            return [];
          }
        }
      });
    } catch (error) {
    console.error(error);
    throw error;
  }
  }
}
`
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonacoExtensions;
}
