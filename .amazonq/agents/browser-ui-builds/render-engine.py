#!/usr/bin/env python3

class Box:
    def __init__(self, x, y, width, height, tag='div'):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.tag = tag
        self.children = []
    
    def add_child(self, child):
        self.children.append(child)
    
    def render(self):
        lines = []
        lines.append(f"Box({self.tag}): x={self.x}, y={self.y}, w={self.width}, h={self.height}")
        for child in self.children:
            child_lines = child.render()
            for line in child_lines:
                lines.append("  " + line)
        return lines

class RenderEngine:
    def __init__(self):
        self.viewport_width = 800
        self.viewport_height = 600
    
    def layout(self, dom_tree):
        return self._layout_node(dom_tree, 0, 0, self.viewport_width)
    
    def _layout_node(self, node, x, y, width):
        if node['type'] == 'text':
            return Box(x, y, width, 20, 'text')
        
        box = Box(x, y, width, 0, node['tag'])
        current_y = y
        
        for child in node.get('children', []):
            child_box = self._layout_node(child, x, current_y, width)
            box.add_child(child_box)
            current_y += child_box.height
        
        box.height = current_y - y if box.children else 40
        return box
    
    def paint(self, box):
        for line in box.render():
            print(line)

# Test
dom = {
    'type': 'element',
    'tag': 'body',
    'children': [
        {'type': 'element', 'tag': 'h1', 'children': [{'type': 'text'}]},
        {'type': 'element', 'tag': 'p', 'children': [{'type': 'text'}]},
        {'type': 'element', 'tag': 'div', 'children': [
            {'type': 'element', 'tag': 'span', 'children': [{'type': 'text'}]}
        ]}
    ]
}

engine = RenderEngine()
layout = engine.layout(dom)
engine.paint(layout)
