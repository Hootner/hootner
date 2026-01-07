#!/usr/bin/env python3

class Image:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.pixels = [[(0, 0, 0) for _ in range(width)] for _ in range(height)]
    
    def set_pixel(self, x, y, rgb):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[y][x] = rgb
    
    def get_pixel(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.pixels[y][x]
        return (0, 0, 0)

class ImageProcessor:
    @staticmethod
    def grayscale(image):
        result = Image(image.width, image.height)
        for y in range(image.height):
            for x in range(image.width):
                r, g, b = image.get_pixel(x, y)
                gray = int(0.299 * r + 0.587 * g + 0.114 * b)
                result.set_pixel(x, y, (gray, gray, gray))
        return result
    
    @staticmethod
    def blur(image, radius=1):
        result = Image(image.width, image.height)
        for y in range(image.height):
            for x in range(image.width):
                r_sum, g_sum, b_sum, count = 0, 0, 0, 0
                
                for dy in range(-radius, radius + 1):
                    for dx in range(-radius, radius + 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < image.width and 0 <= ny < image.height:
                            r, g, b = image.get_pixel(nx, ny)
                            r_sum += r
                            g_sum += g
                            b_sum += b
                            count += 1
                
                result.set_pixel(x, y, (r_sum // count, g_sum // count, b_sum // count))
        return result
    
    @staticmethod
    def edge_detect(image):
        result = Image(image.width, image.height)
        for y in range(1, image.height - 1):
            for x in range(1, image.width - 1):
                gx = (image.get_pixel(x + 1, y)[0] - image.get_pixel(x - 1, y)[0])
                gy = (image.get_pixel(x, y + 1)[0] - image.get_pixel(x, y - 1)[0])
                magnitude = min(255, int((gx ** 2 + gy ** 2) ** 0.5))
                result.set_pixel(x, y, (magnitude, magnitude, magnitude))
        return result

# Test
img = Image(10, 10)
for y in range(10):
    for x in range(10):
        intensity = (x + y) * 12
        img.set_pixel(x, y, (intensity, intensity, intensity))

gray = ImageProcessor.grayscale(img)
blurred = ImageProcessor.blur(img, 1)
edges = ImageProcessor.edge_detect(img)

print(f"Original: {img.get_pixel(5, 5)}")
print(f"Grayscale: {gray.get_pixel(5, 5)}")
print(f"Blurred: {blurred.get_pixel(5, 5)}")
