#!/usr/bin/env python3
import math

class Vec3:
    def __init__(self, x=0, y=0, z=0):
        self.x, self.y, self.z = x, y, z
    
    def __repr__(self):
        return f"Vec3({self.x:.2f}, {self.y:.2f}, {self.z:.2f})"

class Triangle:
    def __init__(self, v0, v1, v2):
        self.vertices = [v0, v1, v2]

class Rasterizer:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.buffer = [[' ' for _ in range(width)] for _ in range(height)]
    
    def project(self, v):
        # Simple perspective projection
        fov = 90
        aspect = self.width / self.height
        near = 0.1
        far = 100
        
        scale = 1 / math.tan(math.radians(fov / 2))
        
        x = v.x * scale / (aspect * v.z)
        y = v.y * scale / v.z
        
        # Convert to screen space
        sx = int((x + 1) * self.width / 2)
        sy = int((1 - y) * self.height / 2)
        
        return (sx, sy)
    
    def draw_line(self, x0, y0, x1, y1, char='*'):
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy
        
        while True:
            if 0 <= x0 < self.width and 0 <= y0 < self.height:
                self.buffer[y0][x0] = char
            
            if x0 == x1 and y0 == y1:
                break
            
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x0 += sx
            if e2 < dx:
                err += dx
                y0 += sy
    
    def draw_triangle(self, tri):
        points = [self.project(v) for v in tri.vertices]
        
        for i in range(3):
            x0, y0 = points[i]
            x1, y1 = points[(i + 1) % 3]
            self.draw_line(x0, y0, x1, y1)
    
    def render(self):
        for row in self.buffer:
            print(''.join(row))

# Test
rasterizer = Rasterizer(60, 30)

triangle = Triangle(
    Vec3(-0.5, -0.5, 2),
    Vec3(0.5, -0.5, 2),
    Vec3(0, 0.5, 2)
)

rasterizer.draw_triangle(triangle)
rasterizer.render()
