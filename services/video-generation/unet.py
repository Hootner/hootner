"""UNet Model"""

class UNet:
    def __init__(self, channels=3):
        self.channels = channels
    
    def forward(self, x):
        return x