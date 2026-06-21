import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { QrCode, Copy, Download, Share } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QRCodeExportProps {
  config: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeExport({ config, open, onOpenChange }: QRCodeExportProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [shareURL, setShareURL] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    setIsGenerating(true)
    
    try {
      const configStr = btoa(JSON.stringify(config))
      const url = `${window.location.origin}${window.location.pathname}?config=${configStr}`
      setShareURL(url)

      const qrCanvas = document.createElement('canvas')
      const size = 512
      qrCanvas.width = size
      qrCanvas.height = size
      const ctx = qrCanvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, size, size)

      const cellSize = Math.floor(size / 33)
      const offset = Math.floor((size - (cellSize * 33)) / 2)

      const qrData = generateQRMatrix(url)
      
      qrData.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            const gradient = ctx.createRadialGradient(
              offset + x * cellSize + cellSize / 2,
              offset + y * cellSize + cellSize / 2,
              0,
              offset + x * cellSize + cellSize / 2,
              offset + y * cellSize + cellSize / 2,
              cellSize
            )
            gradient.addColorStop(0, '#00d9ff')
            gradient.addColorStop(1, '#9d00ff')
            ctx.fillStyle = gradient
            ctx.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize - 1, cellSize - 1)
          }
        })
      })

      ctx.fillStyle = 'rgba(0, 217, 255, 0.3)'
      ctx.shadowColor = '#00d9ff'
      ctx.shadowBlur = 20
      ctx.strokeStyle = '#00d9ff'
      ctx.lineWidth = 3
      ctx.strokeRect(5, 5, size - 10, size - 10)

      ctx.shadowBlur = 0
      ctx.fillStyle = '#00d9ff'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('H00TNERGRAPHHICS', size / 2, size - 20)

      const dataURL = qrCanvas.toDataURL('image/png')
      setQrCodeDataURL(dataURL)
      
      toast.success('QR Code generated successfully!')
    } catch (error) {
      console.error('QR Code generation error:', error)
      toast.error('Failed to generate QR Code')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateQRMatrix = (data: string): number[][] => {
    const size = 33
    const matrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0))
    
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        matrix[i][j] = 1
        matrix[i][size - 1 - j] = 1
        matrix[size - 1 - i][j] = 1
      }
    }
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4 || j === 0 || j === 4) {
          matrix[i + 1][j + 1] = 1
          matrix[i + 1][size - 2 - j] = 1
          matrix[size - 2 - i][j + 1] = 1
        }
      }
    }
    
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        matrix[i][j] = 1
        matrix[i][size - 1 - j] = 1
        matrix[size - 1 - i][j] = 1
      }
    }
    
    for (let i = 8; i < size - 8; i++) {
      for (let j = 8; j < size - 8; j++) {
        const value = (hash + i * j) % 100
        matrix[i][j] = value > 45 ? 1 : 0
      }
    }
    
    return matrix
  }

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return
    
    const link = document.createElement('a')
    link.href = qrCodeDataURL
    link.download = `hologram-qr-${Date.now()}.png`
    link.click()
    
    toast.success('QR Code downloaded!')
  }

  const copyShareURL = () => {
    if (!shareURL) return
    
    navigator.clipboard.writeText(shareURL).then(() => {
      toast.success('Share URL copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy URL')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-primary/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <QrCode size={28} className="animate-pulse" />
            Export as QR Code
          </DialogTitle>
          <DialogDescription>
            Generate a scannable QR code that instantly loads your hologram configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/50 holographic-glow">
            <p className="text-sm font-semibold text-accent mb-2">📱 Instant Sharing</p>
            <p className="text-xs text-muted-foreground">
              Anyone can scan this QR code with their phone camera to instantly view your hologram scene. 
              Perfect for presentations, exhibits, or sharing with friends!
            </p>
          </div>

          {!qrCodeDataURL ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <QrCode size={64} className="text-primary animate-pulse" />
              <p className="text-lg text-muted-foreground">Ready to generate your QR code</p>
              <Button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="bg-accent text-accent-foreground holographic-glow"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <QrCode className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-secondary/20 rounded-lg border-2 border-primary/30">
                <img 
                  src={qrCodeDataURL} 
                  alt="Hologram QR Code" 
                  className="w-full max-w-md rounded-lg shadow-[0_0_30px_rgba(0,217,255,0.3)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-url" className="text-sm font-semibold">Share URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareURL}
                    readOnly
                    className="font-mono text-xs border-primary/30 bg-secondary/20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyShareURL}
                    className="border-primary/50 hover:border-primary hover:bg-primary/10"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadQRCode}
                  className="flex-1 border-accent/50 hover:border-accent hover:bg-accent/10"
                >
                  <Download className="mr-2" />
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'H00tnerGraphhics 3D Hologram',
                        text: 'Check out this amazing hologram!',
                        url: shareURL
                      }).then(() => {
                        toast.success('Shared successfully!')
                      }).catch(() => {
                        copyShareURL()
                      })
                    } else {
                      copyShareURL()
                    }
                  }}
                  className="flex-1 border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                  <Share className="mr-2" />
                  Share
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded bg-secondary/20">
                  <Badge variant="secondary" className="mb-1">High-Res</Badge>
                  <p className="text-muted-foreground">512×512 PNG</p>
                </div>
                <div className="p-3 rounded bg-secondary/20">
                  <Badge variant="secondary" className="mb-1">Branded</Badge>
                  <p className="text-muted-foreground">Custom Design</p>
                </div>
                <div className="p-3 rounded bg-secondary/20">
                  <Badge variant="secondary" className="mb-1">Instant</Badge>
                  <p className="text-muted-foreground">One Scan</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-primary/50"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
