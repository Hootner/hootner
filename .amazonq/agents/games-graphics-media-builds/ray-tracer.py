#!/usr/bin/env python3
import math

class Vec3:
    def __init__(self, x=0, y=0, z=0):
        self.x, self.y, self.z = x, y, z
    
    def __add__(self, v):
        return Vec3(self.x + v.x, self.y + v.y, self.z + v.z)
    
    def __sub__(self, v):
        return Vec3(self.x - v.x, self.y - v.y, self.z - v.z)
    
    def __mul__(self, s):
        return Vec3(self.x * s, self.y * s, self.z * s)
    
    def dot(self, v):
        return self.x * v.x + self.y * v.y + self.z * v.z
    
    def length(self):
        return math.sqrt(self.dot(self))
    
    def normalize(self):
        l = self.length()
        return Vec3(self.x / l, self.y / l, self.z / l)

class Ray:
    def __init__(self, origin, direction):
        self.origin = origin
        self.direction = direction.normalize()
    
    def at(self, t):
        return self.origin + self.direction * t

class Sphere:
    def __init__(self, center, radius):
        self.center = center
        self.radius = radius
    
    def intersect(self, ray):
        oc = ray.origin - self.center
        a = ray.direction.dot(ray.direction)
        b = 2.0 * oc.dot(ray.direction)
        c = oc.dot(oc) - self.radius * self.radius
        discriminant = b * b - 4 * a * c
        
        if discriminant < 0:
            return None
        
        t = (-b - math.sqrt(discriminant)) / (2.0 * a)
        return t if t > 0 else None

class RayTracer:
    def __init__(self, width=80, height=40):
        self.width = width
        self.height = height
        self.spheres = []
    
    def add_sphere(self, sphere):
        self.spheres.append(sphere)
    
    def trace(self, ray):
        closest_t = float('inf')
        hit = False
        
        for sphere in self.spheres:
            t = sphere.intersect(ray)
            if t and t < closest_t:
                closest_t = t
                hit = True
        
        return hit
    
    def render(self):
        for y in range(self.height):
            for x in range(self.width):
                u = (x / self.width) * 2 - 1
                v = 1 - (y / self.height) * 2
                
                ray = Ray(Vec3(0, 0, 0), Vec3(u, v, -1))
                
                if self.trace(ray):
                    print('*', end='')
                else:
                    print(' ', end='')
            print()

# Test
tracer = RayTracer()
tracer.add_sphere(Sphere(Vec3(0, 0, -3), 1))
tracer.render()
