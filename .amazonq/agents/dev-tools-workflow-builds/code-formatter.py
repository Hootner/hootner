#!/usr/bin/env python3
import re

class CodeFormatter:
    def __init__(self, indent_size=2):
        self.indent_size = indent_size
    
    def format_js(self, code):
        lines = code.split('\n')
        formatted = []
        indent_level = 0
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            # Decrease indent for closing braces
            if stripped.startswith('}'):
                indent_level = max(0, indent_level - 1)
            
            # Add indentation
            formatted.append(' ' * (indent_level * self.indent_size) + stripped)
            
            # Increase indent for opening braces
            if stripped.endswith('{'):
                indent_level += 1
        
        return '\n'.join(formatted)
    
    def format_json(self, json_str):
        import json
        obj = json.loads(json_str)
        return json.dumps(obj, indent=self.indent_size)
    
    def format_css(self, code):
        # Remove extra whitespace
        code = re.sub(r'\s+', ' ', code)
        
        # Add newlines after braces
        code = code.replace('{', ' {\n  ')
        code = code.replace('}', '\n}\n')
        code = code.replace(';', ';\n  ')
        
        # Clean up
        lines = [l.strip() for l in code.split('\n') if l.strip()]
        return '\n'.join(lines)

# Test
formatter = CodeFormatter()

js_code = """
function hello(){console.log('hello');if(true){return 42;}}
"""

css_code = """
body{margin:0;padding:0;}div{color:red;background:blue;}
"""

print("Formatted JavaScript:")
print(formatter.format_js(js_code))

print("\nFormatted CSS:")
print(formatter.format_css(css_code))
