export interface ImageTo3DResult {
  imageData: ImageData
  depthMap: Float32Array
  width: number
  height: number
  textureUrl: string
}

export interface ImageTo3DOptions {
  depthStrength: number
  segments: number
  method: 'extrude' | 'displace' | 'depth-map' | 'relief'
  smoothing: number
  invertDepth: boolean
}

export async function loadImageToCanvas(file: File): Promise<{ imageData: ImageData; canvas: HTMLCanvasElement; textureUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const textureUrl = e.target?.result as string
        
        resolve({ imageData, canvas, textureUrl })
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function generateDepthMapFromLuminance(imageData: ImageData, invertDepth: boolean = false): Float32Array {
  const { data, width, height } = imageData
  const depthMap = new Float32Array(width * height)
  
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    depthMap[i] = invertDepth ? 1 - luminance : luminance
  }
  
  return depthMap
}

export function generateDepthMapFromEdges(imageData: ImageData, invertDepth: boolean = false): Float32Array {
  const { data, width, height } = imageData
  const depthMap = new Float32Array(width * height)
  
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ]
  
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          
          gx += gray * sobelX[ky + 1][kx + 1]
          gy += gray * sobelY[ky + 1][kx + 1]
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) / 255
      const idx = y * width + x
      depthMap[idx] = invertDepth ? 1 - magnitude : magnitude
    }
  }
  
  return depthMap
}

export function smoothDepthMap(depthMap: Float32Array, width: number, height: number, radius: number = 1): Float32Array {
  const smoothed = new Float32Array(width * height)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let count = 0
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = x + kx
          const ny = y + ky
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += depthMap[ny * width + nx]
            count++
          }
        }
      }
      
      smoothed[y * width + x] = sum / count
    }
  }
  
  return smoothed
}

export async function convertImageTo3D(
  file: File,
  options: ImageTo3DOptions
): Promise<ImageTo3DResult> {
  const { imageData, textureUrl } = await loadImageToCanvas(file)
  const { width, height } = imageData
  
  let depthMap: Float32Array
  
  switch (options.method) {
    case 'depth-map':
      depthMap = generateDepthMapFromLuminance(imageData, options.invertDepth)
      break
    case 'extrude':
      depthMap = generateDepthMapFromLuminance(imageData, options.invertDepth)
      break
    case 'displace':
      depthMap = generateDepthMapFromEdges(imageData, options.invertDepth)
      break
    case 'relief':
      const lumDepth = generateDepthMapFromLuminance(imageData, options.invertDepth)
      const edgeDepth = generateDepthMapFromEdges(imageData, options.invertDepth)
      depthMap = new Float32Array(width * height)
      for (let i = 0; i < depthMap.length; i++) {
        depthMap[i] = (lumDepth[i] * 0.7 + edgeDepth[i] * 0.3)
      }
      break
    default:
      depthMap = generateDepthMapFromLuminance(imageData, options.invertDepth)
  }
  
  if (options.smoothing > 0) {
    const smoothRadius = Math.ceil(options.smoothing * 3)
    depthMap = smoothDepthMap(depthMap, width, height, smoothRadius)
  }
  
  return {
    imageData,
    depthMap,
    width,
    height,
    textureUrl
  }
}

export function normalizeDepthMap(depthMap: Float32Array): Float32Array {
  let min = Infinity
  let max = -Infinity
  
  for (let i = 0; i < depthMap.length; i++) {
    if (depthMap[i] < min) min = depthMap[i]
    if (depthMap[i] > max) max = depthMap[i]
  }
  
  const range = max - min
  const normalized = new Float32Array(depthMap.length)
  
  if (range === 0) {
    normalized.fill(0.5)
    return normalized
  }
  
  for (let i = 0; i < depthMap.length; i++) {
    normalized[i] = (depthMap[i] - min) / range
  }
  
  return normalized
}
