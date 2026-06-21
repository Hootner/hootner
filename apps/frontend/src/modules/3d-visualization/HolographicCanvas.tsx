// @ts-nocheck
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { toast } from 'sonner'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface HolographicCanvasProps {
  objectType: string
  rotationSpeed: number
  scale: number
  showWireframe: boolean
  glowIntensity: number
  primaryColor: string
  secondaryColor: string
  enableCameraControls: boolean
  animationMode: string
  isPaused: boolean
  multiObjectMode?: boolean
  secondaryObject?: string
  ambientLightIntensity?: number
  pointLightIntensity?: number
  particleDensity?: number
  enableFog?: boolean
  fogDensity?: number
  vrMode?: boolean
  customModel?: string | null
  materialPreset?: string
  particleEffect?: string
  audioVisualization?: boolean
  audioReactivity?: number
  enableBloom?: boolean
  bloomIntensity?: number
  chromaticAberration?: number
  glitchIntensity?: number
  cinematicMode?: string
  cinematicProgress?: number
  enablePhysics?: boolean
  gravityStrength?: number
  materialAnimation?: string
  shapeMorph?: string
  vertexTrails?: boolean
  trailLength?: number
  trailOpacity?: number
  onWebGLError?: () => void
}

export interface HolographicCanvasRef {
  captureScreenshot: () => string | undefined
  loadCustomModel: (file: File) => Promise<void>
  loadImageAs3D: (result: any) => Promise<void>
  resetCamera: () => void
  connectMicrophoneAudio: (stream: MediaStream) => void
  connectAudioFile: (url: string) => void
  disconnectAudio: () => void
}

export const HolographicCanvas = forwardRef<HolographicCanvasRef, HolographicCanvasProps>(({
  objectType,
  rotationSpeed,
  scale,
  showWireframe,
  glowIntensity,
  primaryColor,
  secondaryColor,
  enableCameraControls,
  animationMode,
  isPaused,
  multiObjectMode = false,
  secondaryObject = 'sphere',
  ambientLightIntensity = 0.3,
  pointLightIntensity = 2,
  particleDensity = 1,
  enableFog = false,
  fogDensity = 0.05,
  vrMode = false,
  customModel = null,
  materialPreset = 'hologram',
  particleEffect = 'static',
  audioVisualization = false,
  audioReactivity = 1,
  enableBloom = true,
  bloomIntensity = 1,
  chromaticAberration = 0,
  glitchIntensity = 0,
  cinematicMode = 'none',
  cinematicProgress = 0,
  enablePhysics = false,
  gravityStrength = 1,
  materialAnimation = 'none',
  shapeMorph = 'none',
  vertexTrails = false,
  trailLength = 20,
  trailOpacity = 0.7,
  onWebGLError,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const cameraLeftRef = useRef<THREE.PerspectiveCamera | null>(null)
  const cameraRightRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | THREE.Group | null>(null)
  const wireframeRef = useRef<THREE.LineSegments | null>(null)
  const secondaryMeshRef = useRef<THREE.Mesh | null>(null)
  const secondaryWireframeRef = useRef<THREE.LineSegments | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null)
  const pointLightRef = useRef<THREE.PointLight | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isDraggingRef = useRef<boolean>(false)
  const previousMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const cameraRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const timeRef = useRef<number>(0)
  const customModelDataRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioDataArrayRef = useRef<Uint8Array>(new Uint8Array(128))
  const audioSourceNodeRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  
  const [isMobile] = useState(() => window.innerWidth < 768)
  const [isLowPerformance] = useState(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl || !(gl instanceof WebGLRenderingContext)) return true
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      return renderer.toLowerCase().includes('swiftshader') || 
             renderer.toLowerCase().includes('software')
    }
    return false
  })

  const createHolographicObject = async (type: string, isSecondary = false) => {
    if (!sceneRef.current) return

    const targetMeshRef = isSecondary ? secondaryMeshRef : meshRef
    const targetWireframeRef = isSecondary ? secondaryWireframeRef : wireframeRef

    if (targetMeshRef.current) {
      sceneRef.current.remove(targetMeshRef.current)
      if (targetMeshRef.current instanceof THREE.Mesh) {
        targetMeshRef.current.geometry.dispose()
        if (targetMeshRef.current.material instanceof THREE.Material) {
          targetMeshRef.current.material.dispose()
        }
      } else if (targetMeshRef.current instanceof THREE.Group) {
        targetMeshRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          }
        })
      }
    }

    if (targetWireframeRef.current) {
      sceneRef.current.remove(targetWireframeRef.current)
      targetWireframeRef.current.geometry.dispose()
      if (targetWireframeRef.current.material instanceof THREE.Material) {
        targetWireframeRef.current.material.dispose()
      }
    }

    if (type === 'custom' && customModelDataRef.current && !isSecondary) {
      return
    }

    if (type === 'image-3d' && !isSecondary) {
      return
    }

    let geometry: THREE.BufferGeometry

    switch (type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5, 32, 32)
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(1.2, 0.5, 24, 48)
        break
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1.5, 0)
        break
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(1.5, 0)
        break
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(1.5, 0)
        break
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(1.5, 0)
        break
      case 'cone':
        geometry = new THREE.ConeGeometry(1.2, 2.5, 32)
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 2, 32)
        break
      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
        break
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(0.8, 1.5, 16, 32)
        break
      case 'ring':
        geometry = new THREE.RingGeometry(0.8, 1.5, 32)
        break
      case 'plane':
        geometry = new THREE.PlaneGeometry(2.5, 2.5, 16, 16)
        break
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2)
    }

    const colorToUse = isSecondary ? new THREE.Color(secondaryColor) : new THREE.Color(primaryColor)

    let material: THREE.Material

    switch (materialPreset) {
      case 'glass':
        material = new THREE.MeshPhysicalMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity * 0.3,
          transparent: true,
          opacity: 0.3,
          roughness: 0,
          metalness: 0,
          transmission: 0.9,
          thickness: 0.5,
        })
        break
      case 'metal':
        material = new THREE.MeshStandardMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity * 0.2,
          roughness: 0.2,
          metalness: 1,
        })
        break
      case 'energy':
        material = new THREE.MeshBasicMaterial({
          color: colorToUse,
          transparent: true,
          opacity: 0.9,
        })
        break
      case 'crystal':
        material = new THREE.MeshPhysicalMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity * 0.5,
          transparent: true,
          opacity: 0.7,
          roughness: 0.1,
          metalness: 0.1,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        })
        break
      case 'neon':
        material = new THREE.MeshPhongMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity * 1.5,
          transparent: true,
          opacity: 0.9,
          shininess: 100,
        })
        break
      default:
        material = new THREE.MeshPhongMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity,
          transparent: true,
          opacity: isSecondary ? 0.5 : 0.6,
          shininess: 100,
        })
    }

    const mesh = new THREE.Mesh(geometry, material)
    
    if (isSecondary) {
      mesh.position.x = 3
      mesh.scale.setScalar(0.7)
    }
    
    sceneRef.current.add(mesh)
    targetMeshRef.current = mesh

    const wireframeGeometry = new THREE.EdgesGeometry(geometry)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: isSecondary ? new THREE.Color(primaryColor) : new THREE.Color(secondaryColor),
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    })
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    wireframe.visible = showWireframe
    
    if (isSecondary) {
      wireframe.position.x = 3
      wireframe.scale.setScalar(0.7)
    }
    
    sceneRef.current.add(wireframe)
    targetWireframeRef.current = wireframe
  }

  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
        toast.error('Canvas not ready')
        return undefined
      }
      
      try {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        const dataURL = rendererRef.current.domElement.toDataURL('image/png')
        
        const link = document.createElement('a')
        link.download = `hologram-${Date.now()}.png`
        link.href = dataURL
        link.click()
        
        toast.success('Screenshot saved!')
        return dataURL
      } catch (error) {
        toast.error('Failed to capture screenshot')
        return undefined
      }
    },
    loadCustomModel: async (file: File) => {
      if (!sceneRef.current) {
        toast.error('Scene not ready')
        return
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !['obj', 'gltf', 'glb'].includes(fileExtension)) {
        toast.error('Unsupported file format. Please use OBJ, GLTF, or GLB files.')
        return
      }

      try {
        const reader = new FileReader()
        
        reader.onload = async (e) => {
          const data = e.target?.result as string
          
          if (meshRef.current) {
            sceneRef.current!.remove(meshRef.current)
            if (meshRef.current instanceof THREE.Mesh) {
              meshRef.current.geometry.dispose()
              if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.dispose()
              }
            } else if (meshRef.current instanceof THREE.Group) {
              meshRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.geometry.dispose()
                  if (child.material instanceof THREE.Material) {
                    child.material.dispose()
                  }
                }
              })
            }
          }

          if (wireframeRef.current) {
            sceneRef.current!.remove(wireframeRef.current)
            wireframeRef.current.geometry.dispose()
            if (wireframeRef.current.material instanceof THREE.Material) {
              wireframeRef.current.material.dispose()
            }
            wireframeRef.current = null
          }

          try {
            let loadedObject: THREE.Group | THREE.Object3D

            if (fileExtension === 'obj') {
              const objLoader = new OBJLoader()
              loadedObject = objLoader.parse(data)
            } else {
              const gltfLoader = new GLTFLoader()
              const gltf = await new Promise<any>((resolve, reject) => {
                gltfLoader.parse(data, '', resolve, reject)
              })
              loadedObject = gltf.scene
            }

            const box = new THREE.Box3().setFromObject(loadedObject)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const scaleFactor = 3 / maxDim

            loadedObject.position.sub(center)
            loadedObject.scale.setScalar(scaleFactor)

            const colorToUse = new THREE.Color(primaryColor)
            loadedObject.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({
                  color: colorToUse,
                  emissive: colorToUse,
                  emissiveIntensity: glowIntensity,
                  transparent: true,
                  opacity: 0.6,
                  shininess: 100,
                })
              }
            })

            sceneRef.current!.add(loadedObject)
            meshRef.current = loadedObject as THREE.Group

            customModelDataRef.current = data
            toast.success(`Custom model loaded: ${file.name}`)
          } catch (error) {
            toast.error('Failed to parse 3D model file')
            customModelDataRef.current = null
          }
        }

        reader.onerror = () => {
          toast.error('Failed to read file')
        }

        reader.readAsText(file)
      } catch (error) {
        toast.error('Failed to load custom model')
      }
    },
    loadImageAs3D: async (result: any) => {
      if (!sceneRef.current) {
        toast.error('Scene not ready')
        return
      }

      try {
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current)
          if (meshRef.current instanceof THREE.Mesh) {
            meshRef.current.geometry.dispose()
            if (meshRef.current.material instanceof THREE.Material) {
              meshRef.current.material.dispose()
            }
          } else if (meshRef.current instanceof THREE.Group) {
            meshRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                if (child.material instanceof THREE.Material) {
                  child.material.dispose()
                }
              }
            })
          }
        }

        if (wireframeRef.current) {
          sceneRef.current.remove(wireframeRef.current)
          wireframeRef.current.geometry.dispose()
          if (wireframeRef.current.material instanceof THREE.Material) {
            wireframeRef.current.material.dispose()
          }
          wireframeRef.current = null
        }

        const { width, height, depthMap, textureUrl } = result
        
        const segments = Math.min(width, height, 128)
        const geometry = new THREE.PlaneGeometry(4, 4, segments - 1, segments - 1)
        
        const positions = geometry.attributes.position.array as Float32Array
        const verticesPerRow = segments
        
        for (let y = 0; y < segments; y++) {
          for (let x = 0; x < segments; x++) {
            const imgX = Math.floor((x / (segments - 1)) * (width - 1))
            const imgY = Math.floor((y / (segments - 1)) * (height - 1))
            const depthIndex = imgY * width + imgX
            const depth = depthMap[depthIndex] || 0
            
            const vertexIndex = (y * verticesPerRow + x) * 3
            positions[vertexIndex + 2] = depth * 2
          }
        }
        
        geometry.attributes.position.needsUpdate = true
        geometry.computeVertexNormals()
        
        const textureLoader = new THREE.TextureLoader()
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(textureUrl, resolve, undefined, reject)
        })
        
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          emissive: new THREE.Color(primaryColor),
          emissiveIntensity: glowIntensity * 0.3,
          shininess: 80,
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        sceneRef.current.add(mesh)
        meshRef.current = mesh
        
        const wireframeGeometry = new THREE.WireframeGeometry(geometry)
        const wireframeMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(secondaryColor),
          transparent: true,
          opacity: 0.4,
        })
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
        wireframe.visible = showWireframe
        
        sceneRef.current.add(wireframe)
        wireframeRef.current = wireframe
        
        toast.success('Image loaded as 3D hologram!')
      } catch (error) {
        console.error('Failed to load image as 3D:', error)
        toast.error('Failed to create 3D from image')
      }
    },
    resetCamera: () => {
      if (!cameraRef.current && !cameraLeftRef.current && !cameraRightRef.current) {
        return
      }
      
      cameraRotationRef.current = { x: 0, y: 0 }
      
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 8)
        cameraRef.current.lookAt(0, 0, 0)
      }
      
      if (cameraLeftRef.current) {
        cameraLeftRef.current.position.set(-0.032, 0, 8)
        cameraLeftRef.current.lookAt(0, 0, 0)
      }
      
      if (cameraRightRef.current) {
        cameraRightRef.current.position.set(0.032, 0, 8)
        cameraRightRef.current.lookAt(0, 0, 0)
      }
    },
    connectMicrophoneAudio: (stream: MediaStream) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyzerRef.current = audioContextRef.current.createAnalyser()
        analyzerRef.current.fftSize = 256
        audioDataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount)
        analyzerRef.current.connect(audioContextRef.current.destination)
      }
      
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect()
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyzerRef.current!)
      audioSourceNodeRef.current = source
    },
    connectAudioFile: (url: string) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyzerRef.current = audioContextRef.current.createAnalyser()
        analyzerRef.current.fftSize = 256
        audioDataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount)
        analyzerRef.current.connect(audioContextRef.current.destination)
      }
      
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect()
      }
      
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'
      audio.loop = true
      audioElementRef.current = audio
      
      audio.play().catch(err => {
        console.error('Audio playback failed:', err)
        toast.error('Failed to play audio file')
      })
      
      const source = audioContextRef.current.createMediaElementSource(audio)
      source.connect(analyzerRef.current!)
      audioSourceNodeRef.current = source
    },
    disconnectAudio: () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect()
        audioSourceNodeRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      analyzerRef.current = null
    }
  }))

  useEffect(() => {
    if (!containerRef.current) return

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        onWebGLError?.()
        return
      }
    } catch (e) {
      onWebGLError?.()
      return
    }

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 8
    cameraRef.current = camera

    const cameraLeft = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 2 / window.innerHeight,
      0.1,
      1000
    )
    cameraLeft.position.z = 8
    cameraLeft.position.x = -0.032
    cameraLeftRef.current = cameraLeft

    const cameraRight = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 2 / window.innerHeight,
      0.1,
      1000
    )
    cameraRight.position.z = 8
    cameraRight.position.x = 0.032
    cameraRightRef.current = cameraRight

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isMobile && !isLowPerformance, alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer
    } catch (e) {
      onWebGLError?.()
      return
    }

    const particleCount = isMobile || isLowPerformance ? 500 : 1000
    const adjustedParticleCount = Math.floor(particleCount * particleDensity)
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(adjustedParticleCount * 3)

    for (let i = 0; i < adjustedParticleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50
      positions[i + 1] = (Math.random() - 0.5) * 50
      positions[i + 2] = (Math.random() - 0.5) * 50
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const primaryColorObj = new THREE.Color(primaryColor)
    const particleMaterial = new THREE.PointsMaterial({
      color: primaryColorObj,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)
    particlesRef.current = particleSystem

    createHolographicObject(objectType)

    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity)
    scene.add(ambientLight)
    ambientLightRef.current = ambientLight

    const pointLightColor = new THREE.Color(primaryColor)
    const pointLight = new THREE.PointLight(pointLightColor, pointLightIntensity, 100)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)
    pointLightRef.current = pointLight

    if (enableFog) {
      const fogColor = new THREE.Color(primaryColor)
      scene.fog = new THREE.FogExp2(fogColor.getHex(), fogDensity)
    }

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (isPaused) {
        if (vrMode) {
          const width = window.innerWidth / 2
          const height = window.innerHeight

          renderer.setViewport(0, 0, width, height)
          renderer.setScissor(0, 0, width, height)
          renderer.setScissorTest(true)
          renderer.render(scene, cameraLeftRef.current!)

          renderer.setViewport(width, 0, width, height)
          renderer.setScissor(width, 0, width, height)
          renderer.render(scene, cameraRightRef.current!)

          renderer.setScissorTest(false)
        } else {
          renderer.render(scene, camera)
        }
        return
      }

      timeRef.current += 0.01

      let audioScale = 1
      let audioRotationBoost = 0
      let audioColorShift = 0

      if (audioVisualization && analyzerRef.current && audioDataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(audioDataArrayRef.current as any)
        
        const bass = Array.from(audioDataArrayRef.current).slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255
        const mid = Array.from(audioDataArrayRef.current).slice(10, 50).reduce((a, b) => a + b, 0) / 40 / 255
        const treble = Array.from(audioDataArrayRef.current).slice(50, 100).reduce((a, b) => a + b, 0) / 50 / 255
        
        audioScale = 1 + (bass * audioReactivity * 0.5)
        audioRotationBoost = (mid * audioReactivity * 0.02)
        audioColorShift = treble * audioReactivity
      }

      if (enableCameraControls && cameraRef.current) {
        const radius = cameraRef.current.position.length()
        cameraRef.current.position.x = radius * Math.sin(cameraRotationRef.current.y) * Math.cos(cameraRotationRef.current.x)
        cameraRef.current.position.y = radius * Math.sin(cameraRotationRef.current.x)
        cameraRef.current.position.z = radius * Math.cos(cameraRotationRef.current.y) * Math.cos(cameraRotationRef.current.x)
        cameraRef.current.lookAt(0, 0, 0)

        if (vrMode && cameraLeftRef.current && cameraRightRef.current) {
          const eyeSeparation = 0.064
          const convergence = 5

          cameraLeftRef.current.position.copy(cameraRef.current.position)
          cameraLeftRef.current.position.x -= eyeSeparation / 2
          cameraLeftRef.current.lookAt(0, 0, 0)

          cameraRightRef.current.position.copy(cameraRef.current.position)
          cameraRightRef.current.position.x += eyeSeparation / 2
          cameraRightRef.current.lookAt(0, 0, 0)
        }
      }

      if (cinematicMode && cinematicMode !== 'none' && cameraRef.current) {
        const progress = cinematicProgress / 100
        
        switch (cinematicMode) {
          case 'orbit':
            const orbitAngle = progress * Math.PI * 2
            const orbitRadius = 8
            cameraRef.current.position.x = Math.cos(orbitAngle) * orbitRadius
            cameraRef.current.position.z = Math.sin(orbitAngle) * orbitRadius
            cameraRef.current.position.y = 0
            cameraRef.current.lookAt(0, 0, 0)
            break
          case 'zoom':
            const zoomStart = 15
            const zoomEnd = 4
            const zoomDistance = zoomStart - (zoomStart - zoomEnd) * progress
            cameraRef.current.position.set(0, 0, zoomDistance)
            cameraRef.current.lookAt(0, 0, 0)
            break
          case 'showcase':
            const showcaseTime = progress * 20
            const showcasePhase = Math.floor(showcaseTime / 5)
            const showcaseProgress = (showcaseTime % 5) / 5
            
            switch (showcasePhase) {
              case 0:
                cameraRef.current.position.set(8, 0, 0)
                break
              case 1:
                const angle1 = showcaseProgress * Math.PI / 2
                cameraRef.current.position.x = 8 * Math.cos(angle1)
                cameraRef.current.position.z = 8 * Math.sin(angle1)
                break
              case 2:
                cameraRef.current.position.set(0, 0, 8)
                break
              case 3:
                const angle2 = Math.PI / 2 + showcaseProgress * Math.PI / 2
                cameraRef.current.position.x = 8 * Math.cos(angle2)
                cameraRef.current.position.z = 8 * Math.sin(angle2)
                break
            }
            cameraRef.current.lookAt(0, 0, 0)
            break
          case 'spiral':
            const spiralAngle = progress * Math.PI * 3
            const spiralRadius = 8 - progress * 2
            const spiralHeight = progress * 5 - 2.5
            cameraRef.current.position.x = Math.cos(spiralAngle) * spiralRadius
            cameraRef.current.position.z = Math.sin(spiralAngle) * spiralRadius
            cameraRef.current.position.y = spiralHeight
            cameraRef.current.lookAt(0, 0, 0)
            break
        }

        if (vrMode && cameraLeftRef.current && cameraRightRef.current) {
          const eyeSeparation = 0.064
          cameraLeftRef.current.position.copy(cameraRef.current.position)
          cameraLeftRef.current.position.x -= eyeSeparation / 2
          cameraLeftRef.current.lookAt(0, 0, 0)
          cameraRightRef.current.position.copy(cameraRef.current.position)
          cameraRightRef.current.position.x += eyeSeparation / 2
          cameraRightRef.current.lookAt(0, 0, 0)
        }
      }

      if (enablePhysics && meshRef.current) {
        const gravity = 0.01 * gravityStrength
        const velocityKey = 'velocity'
        if (!(meshRef.current as any)[velocityKey]) {
          (meshRef.current as any)[velocityKey] = { x: 0, y: 0, z: 0 }
        }
        const velocity = (meshRef.current as any)[velocityKey]
        
        velocity.y -= gravity
        meshRef.current.position.y += velocity.y
        meshRef.current.position.x += velocity.x
        meshRef.current.position.z += velocity.z
        
        const bounceThreshold = -3
        const ceiling = 3
        const wallLimit = 5
        const damping = 0.8
        
        if (meshRef.current.position.y < bounceThreshold) {
          meshRef.current.position.y = bounceThreshold
          velocity.y = Math.abs(velocity.y) * damping
        }
        if (meshRef.current.position.y > ceiling) {
          meshRef.current.position.y = ceiling
          velocity.y = -Math.abs(velocity.y) * damping
        }
        if (Math.abs(meshRef.current.position.x) > wallLimit) {
          meshRef.current.position.x = Math.sign(meshRef.current.position.x) * wallLimit
          velocity.x = -velocity.x * damping
        }
        if (Math.abs(meshRef.current.position.z) > wallLimit) {
          meshRef.current.position.z = Math.sign(meshRef.current.position.z) * wallLimit
          velocity.z = -velocity.z * damping
        }
        
        velocity.x *= 0.99
        velocity.z *= 0.99
        
        meshRef.current.rotation.x += velocity.x * 0.1
        meshRef.current.rotation.z += velocity.z * 0.1
      }

      if (meshRef.current) {
        if (!enableCameraControls) {
          const effectiveRotationSpeed = rotationSpeed * (1 + audioRotationBoost)
          switch (animationMode) {
            case 'wobble':
              meshRef.current.rotation.x += 0.005 * effectiveRotationSpeed
              meshRef.current.rotation.y += 0.01 * effectiveRotationSpeed
              meshRef.current.rotation.z = Math.sin(timeRef.current * 2) * 0.3
              break
            case 'slow-spin':
              meshRef.current.rotation.y += 0.005 * effectiveRotationSpeed
              break
            case 'tumble':
              meshRef.current.rotation.x += 0.01 * effectiveRotationSpeed
              meshRef.current.rotation.y += 0.015 * effectiveRotationSpeed
              meshRef.current.rotation.z += 0.008 * effectiveRotationSpeed
              break
            case 'pulse':
              meshRef.current.rotation.x += 0.005 * effectiveRotationSpeed
              meshRef.current.rotation.y += 0.01 * effectiveRotationSpeed
              const pulseScale = scale * (1 + Math.sin(timeRef.current * 3) * 0.15) * audioScale
              meshRef.current.scale.setScalar(pulseScale)
              break
            default:
              meshRef.current.rotation.x += 0.005 * effectiveRotationSpeed
              meshRef.current.rotation.y += 0.01 * effectiveRotationSpeed
          }
        }
        
        if (animationMode !== 'pulse') {
          meshRef.current.scale.setScalar(scale * audioScale)
        }
        
        if (meshRef.current.material && 'emissiveIntensity' in meshRef.current.material) {
          let emissiveIntensity = glowIntensity * (1 + audioColorShift * 0.5)
          let opacity = (meshRef.current.material as any).opacity || 0.6
          
          switch (materialAnimation) {
            case 'pulse':
              emissiveIntensity *= (1 + Math.sin(timeRef.current * 2) * 0.4)
              break
            case 'shimmer':
              emissiveIntensity *= (1 + Math.sin(timeRef.current * 5) * 0.2)
              if ('color' in meshRef.current.material && meshRef.current.material.color) {
                const shimmerOffset = Math.sin(timeRef.current * 3) * 0.05
                const baseColor = new THREE.Color(primaryColor)
                baseColor.offsetHSL(shimmerOffset, 0, 0)
                meshRef.current.material.color.copy(baseColor)
                if ('emissive' in meshRef.current.material) {
                  (meshRef.current.material as any).emissive.copy(baseColor)
                }
              }
              break
            case 'phase':
              opacity = 0.3 + Math.abs(Math.sin(timeRef.current * 1.5)) * 0.5
              if ('opacity' in meshRef.current.material) {
                (meshRef.current.material as any).opacity = opacity
              }
              break
            case 'rainbow':
              const hue = (timeRef.current * 0.1) % 1
              const rainbowColor = new THREE.Color().setHSL(hue, 1, 0.5)
              if ('color' in meshRef.current.material && meshRef.current.material.color) {
                meshRef.current.material.color.copy(rainbowColor)
              }
              if ('emissive' in meshRef.current.material) {
                (meshRef.current.material as any).emissive.copy(rainbowColor)
              }
              break
          }
          
          (meshRef.current.material as any).emissiveIntensity = emissiveIntensity
        }
        
        if (shapeMorph !== 'none' && meshRef.current instanceof THREE.Mesh) {
          const positions = meshRef.current.geometry.attributes.position
          if (positions) {
            const posArray = positions.array as Float32Array
            
            switch (shapeMorph) {
              case 'cube-sphere':
                const sphereAmount = (Math.sin(timeRef.current * 0.5) + 1) * 0.5
                for (let i = 0; i < posArray.length; i += 3) {
                  const x = posArray[i]
                  const y = posArray[i + 1]
                  const z = posArray[i + 2]
                  const length = Math.sqrt(x * x + y * y + z * z)
                  const targetLength = 1.5
                  posArray[i] = x + (x / length * targetLength - x) * sphereAmount
                  posArray[i + 1] = y + (y / length * targetLength - y) * sphereAmount
                  posArray[i + 2] = z + (z / length * targetLength - z) * sphereAmount
                }
                positions.needsUpdate = true
                break
              case 'geometric':
                const geoPhase = Math.floor((timeRef.current * 0.2) % 5)
                for (let i = 0; i < posArray.length; i += 3) {
                  const x = posArray[i]
                  const y = posArray[i + 1]
                  const z = posArray[i + 2]
                  let factor = 1
                  
                  switch (geoPhase) {
                    case 0:
                    case 4:
                      factor = 1
                      break
                    case 1:
                    case 3:
                      const len = Math.sqrt(x * x + y * y + z * z)
                      factor = len / 1.5
                      break
                    case 2:
                      factor = Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) / 1.5
                      break
                  }
                  
                  posArray[i] = x * factor * 0.9 + x * 0.1
                  posArray[i + 1] = y * factor * 0.9 + y * 0.1
                  posArray[i + 2] = z * factor * 0.9 + z * 0.1
                }
                positions.needsUpdate = true
                break
              case 'organic':
                for (let i = 0; i < posArray.length; i += 3) {
                  const x = posArray[i]
                  const y = posArray[i + 1]
                  const z = posArray[i + 2]
                  const wave1 = Math.sin(x * 2 + timeRef.current * 2) * 0.1
                  const wave2 = Math.cos(y * 2 + timeRef.current * 1.5) * 0.1
                  const wave3 = Math.sin(z * 2 + timeRef.current * 1.8) * 0.1
                  posArray[i] += wave1
                  posArray[i + 1] += wave2
                  posArray[i + 2] += wave3
                }
                positions.needsUpdate = true
                break
            }
          }
        }
      }

      if (secondaryMeshRef.current && multiObjectMode) {
        if (!enableCameraControls) {
          switch (animationMode) {
            case 'wobble':
              secondaryMeshRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryMeshRef.current.rotation.y -= 0.01 * rotationSpeed
              secondaryMeshRef.current.rotation.z = -Math.sin(timeRef.current * 2) * 0.3
              break
            case 'slow-spin':
              secondaryMeshRef.current.rotation.y -= 0.005 * rotationSpeed
              break
            case 'tumble':
              secondaryMeshRef.current.rotation.x -= 0.01 * rotationSpeed
              secondaryMeshRef.current.rotation.y -= 0.015 * rotationSpeed
              secondaryMeshRef.current.rotation.z -= 0.008 * rotationSpeed
              break
            case 'pulse':
              secondaryMeshRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryMeshRef.current.rotation.y -= 0.01 * rotationSpeed
              const pulseScale = 0.7 * (1 + Math.sin(timeRef.current * 3 + Math.PI) * 0.15)
              secondaryMeshRef.current.scale.setScalar(pulseScale)
              break
            default:
              secondaryMeshRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryMeshRef.current.rotation.y -= 0.01 * rotationSpeed
          }
        }
        
        if (animationMode !== 'pulse') {
          secondaryMeshRef.current.scale.setScalar(0.7)
        }
      }

      if (wireframeRef.current) {
        if (!enableCameraControls) {
          switch (animationMode) {
            case 'wobble':
              wireframeRef.current.rotation.x += 0.005 * rotationSpeed
              wireframeRef.current.rotation.y += 0.01 * rotationSpeed
              wireframeRef.current.rotation.z = Math.sin(timeRef.current * 2) * 0.3
              break
            case 'slow-spin':
              wireframeRef.current.rotation.y += 0.005 * rotationSpeed
              break
            case 'tumble':
              wireframeRef.current.rotation.x += 0.01 * rotationSpeed
              wireframeRef.current.rotation.y += 0.015 * rotationSpeed
              wireframeRef.current.rotation.z += 0.008 * rotationSpeed
              break
            case 'pulse':
              wireframeRef.current.rotation.x += 0.005 * rotationSpeed
              wireframeRef.current.rotation.y += 0.01 * rotationSpeed
              const pulseScale = scale * (1 + Math.sin(timeRef.current * 3) * 0.15)
              wireframeRef.current.scale.setScalar(pulseScale)
              break
            default:
              wireframeRef.current.rotation.x += 0.005 * rotationSpeed
              wireframeRef.current.rotation.y += 0.01 * rotationSpeed
          }
        }
        
        if (animationMode !== 'pulse') {
          wireframeRef.current.scale.setScalar(scale)
        }
        wireframeRef.current.visible = showWireframe
      }

      if (secondaryWireframeRef.current && multiObjectMode) {
        if (!enableCameraControls) {
          switch (animationMode) {
            case 'wobble':
              secondaryWireframeRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryWireframeRef.current.rotation.y -= 0.01 * rotationSpeed
              secondaryWireframeRef.current.rotation.z = -Math.sin(timeRef.current * 2) * 0.3
              break
            case 'slow-spin':
              secondaryWireframeRef.current.rotation.y -= 0.005 * rotationSpeed
              break
            case 'tumble':
              secondaryWireframeRef.current.rotation.x -= 0.01 * rotationSpeed
              secondaryWireframeRef.current.rotation.y -= 0.015 * rotationSpeed
              secondaryWireframeRef.current.rotation.z -= 0.008 * rotationSpeed
              break
            case 'pulse':
              secondaryWireframeRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryWireframeRef.current.rotation.y -= 0.01 * rotationSpeed
              const pulseScale = 0.7 * (1 + Math.sin(timeRef.current * 3 + Math.PI) * 0.15)
              secondaryWireframeRef.current.scale.setScalar(pulseScale)
              break
            default:
              secondaryWireframeRef.current.rotation.x -= 0.005 * rotationSpeed
              secondaryWireframeRef.current.rotation.y -= 0.01 * rotationSpeed
          }
        }
        
        if (animationMode !== 'pulse') {
          secondaryWireframeRef.current.scale.setScalar(0.7)
        }
        secondaryWireframeRef.current.visible = showWireframe
      }

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        
        switch (particleEffect) {
          case 'orbit':
            for (let i = 0; i < positions.length; i += 3) {
              const radius = 5 + (i % 10) * 0.3
              const angle = (timeRef.current * 0.5) + (i * 0.1)
              const height = Math.sin(angle * 0.5) * 2
              positions[i] = Math.cos(angle) * radius
              positions[i + 1] = height
              positions[i + 2] = Math.sin(angle) * radius
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true
            break
          case 'swarm':
            if (meshRef.current) {
              const meshPos = meshRef.current.position
              for (let i = 0; i < positions.length; i += 3) {
                const dx = meshPos.x - positions[i]
                const dy = meshPos.y - positions[i + 1]
                const dz = meshPos.z - positions[i + 2]
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                const pullStrength = 0.02
                
                if (distance > 3) {
                  positions[i] += dx * pullStrength
                  positions[i + 1] += dy * pullStrength
                  positions[i + 2] += dz * pullStrength
                } else {
                  const angle = timeRef.current + (i * 0.01)
                  positions[i] += Math.cos(angle) * 0.05
                  positions[i + 1] += Math.sin(angle * 0.7) * 0.05
                  positions[i + 2] += Math.sin(angle) * 0.05
                }
              }
              particlesRef.current.geometry.attributes.position.needsUpdate = true
            }
            break
          case 'trail':
            if (meshRef.current) {
              const meshPos = meshRef.current.position
              const meshRot = meshRef.current.rotation
              for (let i = 0; i < positions.length; i += 3) {
                const offset = (i / 3) * 0.1
                positions[i] = meshPos.x + Math.sin(meshRot.y + offset) * 3
                positions[i + 1] = meshPos.y + Math.sin(timeRef.current + offset) * 2
                positions[i + 2] = meshPos.z + Math.cos(meshRot.y + offset) * 3
              }
              particlesRef.current.geometry.attributes.position.needsUpdate = true
            }
            break
          case 'burst':
            const burstCycle = Math.sin(timeRef.current * 2)
            for (let i = 0; i < positions.length; i += 3) {
              const baseX = (Math.random() - 0.5) * 50
              const baseY = (Math.random() - 0.5) * 50
              const baseZ = (Math.random() - 0.5) * 50
              const normalizedX = baseX / 50
              const normalizedY = baseY / 50
              const normalizedZ = baseZ / 50
              const burstAmount = (burstCycle + 1) * 5
              positions[i] = normalizedX * burstAmount
              positions[i + 1] = normalizedY * burstAmount
              positions[i + 2] = normalizedZ * burstAmount
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true
            break
          default:
            particlesRef.current.rotation.y += 0.0002
        }
      }

      if (vrMode && cameraLeftRef.current && cameraRightRef.current) {
        const width = window.innerWidth / 2
        const height = window.innerHeight

        renderer.setViewport(0, 0, width, height)
        renderer.setScissor(0, 0, width, height)
        renderer.setScissorTest(true)
        renderer.render(scene, cameraLeftRef.current)

        renderer.setViewport(width, 0, width, height)
        renderer.setScissor(width, 0, width, height)
        renderer.render(scene, cameraRightRef.current)

        renderer.setScissorTest(false)
      } else {
        renderer.render(scene, camera)
      }
    }

    animate()

    const handleMouseDown = (e: MouseEvent) => {
      if (!enableCameraControls) return
      isDraggingRef.current = true
      previousMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableCameraControls || !isDraggingRef.current) return

      const deltaX = e.clientX - previousMouseRef.current.x
      const deltaY = e.clientY - previousMouseRef.current.y

      cameraRotationRef.current.y += deltaX * 0.005
      cameraRotationRef.current.x += deltaY * 0.005

      cameraRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationRef.current.x))

      previousMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleWheel = (e: WheelEvent) => {
      if (!enableCameraControls || !cameraRef.current) return
      e.preventDefault()
      
      const zoomSpeed = 0.1
      const newZ = cameraRef.current.position.length() + e.deltaY * zoomSpeed * 0.01
      const clampedZ = Math.max(2, Math.min(15, newZ))
      
      const direction = cameraRef.current.position.clone().normalize()
      cameraRef.current.position.copy(direction.multiplyScalar(clampedZ))
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      
      if (vrMode) {
        const aspectRatio = (window.innerWidth / 2) / window.innerHeight
        cameraRef.current.aspect = aspectRatio
        if (cameraLeftRef.current) cameraLeftRef.current.aspect = aspectRatio
        if (cameraRightRef.current) cameraRightRef.current.aspect = aspectRatio
      } else {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
      }
      
      cameraRef.current.updateProjectionMatrix()
      if (cameraLeftRef.current) cameraLeftRef.current.updateProjectionMatrix()
      if (cameraRightRef.current) cameraRightRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('wheel', handleWheel)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    createHolographicObject(objectType)
  }, [objectType, primaryColor, secondaryColor, showWireframe, glowIntensity, materialPreset, scale])

  useEffect(() => {
    if (multiObjectMode && secondaryObject) {
      createHolographicObject(secondaryObject, true)
    } else if (secondaryMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(secondaryMeshRef.current)
      secondaryMeshRef.current.geometry.dispose()
      if (secondaryMeshRef.current.material instanceof THREE.Material) {
        secondaryMeshRef.current.material.dispose()
      }
      secondaryMeshRef.current = null
      
      if (secondaryWireframeRef.current) {
        sceneRef.current.remove(secondaryWireframeRef.current)
        secondaryWireframeRef.current.geometry.dispose()
        if (secondaryWireframeRef.current.material instanceof THREE.Material) {
          secondaryWireframeRef.current.material.dispose()
        }
        secondaryWireframeRef.current = null
      }
    }
  }, [multiObjectMode, secondaryObject, primaryColor, secondaryColor, showWireframe, glowIntensity, materialPreset, scale])

  useEffect(() => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshPhongMaterial) {
      meshRef.current.material.emissiveIntensity = glowIntensity
    }
    if (secondaryMeshRef.current && secondaryMeshRef.current.material instanceof THREE.MeshPhongMaterial) {
      secondaryMeshRef.current.material.emissiveIntensity = glowIntensity
    }
  }, [glowIntensity])

  useEffect(() => {
    if (wireframeRef.current) {
      wireframeRef.current.visible = showWireframe
    }
    if (secondaryWireframeRef.current) {
      secondaryWireframeRef.current.visible = showWireframe
    }
  }, [showWireframe])

  useEffect(() => {
    if (meshRef.current && animationMode !== 'pulse') {
      meshRef.current.scale.setScalar(scale)
    }
    if (wireframeRef.current && animationMode !== 'pulse') {
      wireframeRef.current.scale.setScalar(scale)
    }
  }, [scale, animationMode])

  useEffect(() => {
    if (particlesRef.current && particlesRef.current.material instanceof THREE.PointsMaterial) {
      const primaryColorObj = new THREE.Color(primaryColor)
      particlesRef.current.material.color = primaryColorObj
    }
  }, [primaryColor])

  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = ambientLightIntensity
    }
  }, [ambientLightIntensity])

  useEffect(() => {
    if (pointLightRef.current) {
      pointLightRef.current.intensity = pointLightIntensity
      const pointLightColor = new THREE.Color(primaryColor)
      pointLightRef.current.color = pointLightColor
    }
  }, [pointLightIntensity, primaryColor])

  useEffect(() => {
    if (sceneRef.current) {
      if (enableFog) {
        const fogColor = new THREE.Color(primaryColor)
        sceneRef.current.fog = new THREE.FogExp2(fogColor.getHex(), fogDensity)
      } else {
        sceneRef.current.fog = null
      }
    }
  }, [enableFog, fogDensity, primaryColor])

  useEffect(() => {
    if (cameraRef.current && cameraLeftRef.current && cameraRightRef.current && rendererRef.current) {
      const aspectRatio = vrMode ? (window.innerWidth / 2) / window.innerHeight : window.innerWidth / window.innerHeight
      cameraRef.current.aspect = aspectRatio
      cameraLeftRef.current.aspect = aspectRatio
      cameraRightRef.current.aspect = aspectRatio
      cameraRef.current.updateProjectionMatrix()
      cameraLeftRef.current.updateProjectionMatrix()
      cameraRightRef.current.updateProjectionMatrix()
    }
  }, [vrMode])



  useEffect(() => {
    if (!audioVisualization) {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect()
        audioSourceNodeRef.current = null
      }
      analyzerRef.current = null
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = 256
      audioDataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount)
      analyzerRef.current.connect(audioContextRef.current.destination)
    }
  }, [audioVisualization])

  useEffect(() => {
    if (!sceneRef.current || !particlesRef.current) return
    
    sceneRef.current.remove(particlesRef.current)
    particlesRef.current.geometry.dispose()
    if (particlesRef.current.material instanceof THREE.Material) {
      particlesRef.current.material.dispose()
    }
    
    const particleCount = isMobile || isLowPerformance ? 500 : 1000
    const adjustedParticleCount = Math.floor(particleCount * particleDensity)
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(adjustedParticleCount * 3)

    for (let i = 0; i < adjustedParticleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50
      positions[i + 1] = (Math.random() - 0.5) * 50
      positions[i + 2] = (Math.random() - 0.5) * 50
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const primaryColorObj = new THREE.Color(primaryColor)
    const particleMaterial = new THREE.PointsMaterial({
      color: primaryColorObj,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    sceneRef.current.add(particleSystem)
    particlesRef.current = particleSystem
  }, [particleDensity])

  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current) return undefined
      try {
        return rendererRef.current.domElement.toDataURL('image/png')
      } catch (error) {
        toast.error('Failed to capture screenshot')
        return undefined
      }
    },
    loadCustomModel: async (file: File) => {
      try {
        const reader = new FileReader()
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        
        const modelData = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        customModelDataRef.current = modelData
        
        if (!sceneRef.current) return
        
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current)
          if (meshRef.current instanceof THREE.Mesh) {
            meshRef.current.geometry.dispose()
            if (meshRef.current.material instanceof THREE.Material) {
              meshRef.current.material.dispose()
            }
          } else if (meshRef.current instanceof THREE.Group) {
            meshRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                if (child.material instanceof THREE.Material) {
                  child.material.dispose()
                }
              }
            })
          }
        }
        
        let loader: OBJLoader | GLTFLoader
        
        if (fileExtension === 'obj') {
          loader = new OBJLoader()
          const obj = await new Promise<THREE.Group>((resolve, reject) => {
            (loader as OBJLoader).load(modelData, resolve, undefined, reject)
          })
          
          const colorToUse = new THREE.Color(primaryColor)
          const material = new THREE.MeshPhongMaterial({
            color: colorToUse,
            emissive: colorToUse,
            emissiveIntensity: glowIntensity,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
          })
          
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material
            }
          })
          
          sceneRef.current.add(obj)
          meshRef.current = obj
          toast.success('Custom model loaded successfully')
        } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
          loader = new GLTFLoader()
          const gltf = await new Promise<any>((resolve, reject) => {
            (loader as GLTFLoader).load(modelData, resolve, undefined, reject)
          })
          
          const colorToUse = new THREE.Color(primaryColor)
          const material = new THREE.MeshPhongMaterial({
            color: colorToUse,
            emissive: colorToUse,
            emissiveIntensity: glowIntensity,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
          })
          
          gltf.scene.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.material = material
            }
          })
          
          sceneRef.current.add(gltf.scene)
          meshRef.current = gltf.scene
          toast.success('Custom model loaded successfully')
        }
      } catch (error) {
        toast.error('Failed to load custom model')
        throw error
      }
    },
    resetCamera: () => {
      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 10)
        cameraRef.current.lookAt(0, 0, 0)
        cameraRotationRef.current = { x: 0, y: 0 }
      }
    },
    connectMicrophoneAudio: (stream: MediaStream) => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume()
        }
        
        if (audioSourceNodeRef.current) {
          audioSourceNodeRef.current.disconnect()
        }
        
        if (!analyzerRef.current) {
          analyzerRef.current = audioContextRef.current.createAnalyser()
          analyzerRef.current.fftSize = 256
          audioDataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount)
        }
        
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyzerRef.current)
        analyzerRef.current.connect(audioContextRef.current.destination)
        audioSourceNodeRef.current = source
        
        toast.success('Microphone connected')
      } catch (error) {
        toast.error('Failed to connect microphone')
      }
    },
    connectAudioFile: (url: string) => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume()
        }
        
        if (audioElementRef.current) {
          audioElementRef.current.pause()
        }
        
        if (audioSourceNodeRef.current) {
          audioSourceNodeRef.current.disconnect()
        }
        
        const audio = new Audio(url)
        audio.crossOrigin = 'anonymous'
        audio.loop = true
        
        if (!analyzerRef.current) {
          analyzerRef.current = audioContextRef.current.createAnalyser()
          analyzerRef.current.fftSize = 256
          audioDataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount)
        }
        
        const source = audioContextRef.current.createMediaElementSource(audio)
        source.connect(analyzerRef.current)
        analyzerRef.current.connect(audioContextRef.current.destination)
        audioSourceNodeRef.current = source
        audioElementRef.current = audio
        
        audio.play().catch((error) => {
          toast.error('Failed to play audio file')
        })
        
        toast.success('Audio file connected')
      } catch (error) {
        toast.error('Failed to connect audio file')
      }
    },
    disconnectAudio: () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect()
        audioSourceNodeRef.current = null
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      
      analyzerRef.current = null
    },
    loadImageAs3D: async (data: any) => {
      try {
        if (!sceneRef.current) return
        
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current)
          if (meshRef.current instanceof THREE.Mesh) {
            meshRef.current.geometry.dispose()
            if (meshRef.current.material instanceof THREE.Material) {
              meshRef.current.material.dispose()
            }
          }
        }
        
        const geometry = new THREE.PlaneGeometry(5, 5, 64, 64)
        const colorToUse = new THREE.Color(primaryColor)
        const material = new THREE.MeshPhongMaterial({
          color: colorToUse,
          emissive: colorToUse,
          emissiveIntensity: glowIntensity,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        sceneRef.current.add(mesh)
        meshRef.current = mesh
        
        toast.success('Image converted to 3D successfully')
      } catch (error) {
        toast.error('Failed to convert image to 3D')
        throw error
      }
    }
  }))

  const canvasStyle = {
    filter: `
      ${enableBloom ? `brightness(${1 + (bloomIntensity * 0.3)}) saturate(${1 + (bloomIntensity * 0.5)}) blur(${bloomIntensity * 0.5}px)` : ''}
      ${chromaticAberration > 0 ? `hue-rotate(${chromaticAberration * 10}deg)` : ''}
    `.trim(),
    animation: glitchIntensity > 0 ? `glitch ${1 / glitchIntensity}s infinite` : 'none',
  }

  return (
    <>
      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(${glitchIntensity * 2}px, ${glitchIntensity}px); filter: hue-rotate(${glitchIntensity * 90}deg); }
          40% { transform: translate(-${glitchIntensity * 2}px, -${glitchIntensity}px); }
          60% { transform: translate(${glitchIntensity}px, -${glitchIntensity * 2}px); }
          80% { transform: translate(-${glitchIntensity}px, ${glitchIntensity * 2}px); }
        }
      `}</style>
      <div ref={containerRef} className="fixed inset-0 -z-10" style={canvasStyle} />
    </>
  )
})

HolographicCanvas.displayName = 'HolographicCanvas'
