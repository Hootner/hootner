#!/usr/bin/env python3

class Frame:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.pixels = [[0 for _ in range(width)] for _ in range(height)]
    
    def set_pixel(self, x, y, value):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[y][x] = value
    
    def get_pixel(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.pixels[y][x]
        return 0

class VideoCodec:
    def __init__(self):
        self.quality = 50
    
    def encode_frame(self, frame):
        # Simple run-length encoding
        encoded = []
        
        for row in frame.pixels:
            count = 1
            prev = row[0]
            
            for pixel in row[1:]:
                if pixel == prev:
                    count += 1
                else:
                    encoded.append((prev, count))
                    prev = pixel
                    count = 1
            
            encoded.append((prev, count))
        
        return encoded
    
    def decode_frame(self, encoded, width, height):
        frame = Frame(width, height)
        x, y = 0, 0
        
        for value, count in encoded:
            for _ in range(count):
                frame.set_pixel(x, y, value)
                x += 1
                if x >= width:
                    x = 0
                    y += 1
        
        return frame
    
    def compress_motion(self, frame1, frame2):
        # Simple motion vector calculation
        vectors = []
        
        for y in range(frame1.height):
            for x in range(frame1.width):
                diff = frame2.get_pixel(x, y) - frame1.get_pixel(x, y)
                if abs(diff) > 10:
                    vectors.append((x, y, diff))
        
        return vectors

# Test
codec = VideoCodec()

frame = Frame(10, 10)
for i in range(10):
    for j in range(10):
        frame.set_pixel(i, j, (i + j) % 256)

encoded = codec.encode_frame(frame)
print(f"Original size: {10 * 10} pixels")
print(f"Encoded size: {len(encoded)} runs")
print(f"Compression ratio: {(10 * 10) / len(encoded):.2f}x")

decoded = codec.decode_frame(encoded, 10, 10)
print(f"Decoded successfully: {decoded.get_pixel(5, 5) == frame.get_pixel(5, 5)}")
