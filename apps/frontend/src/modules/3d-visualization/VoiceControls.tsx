import { useState, useEffect, useRef } from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Microphone, Stop, X, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface VoiceCommand {
  command: string
  action: string
  examples: string[]
}

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: 'pause',
    action: 'pause',
    examples: ['pause', 'stop', 'freeze']
  },
  {
    command: 'play',
    action: 'play',
    examples: ['play', 'resume', 'start', 'continue']
  },
  {
    command: 'faster',
    action: 'speed-up',
    examples: ['faster', 'speed up', 'go faster', 'increase speed']
  },
  {
    command: 'slower',
    action: 'speed-down',
    examples: ['slower', 'slow down', 'go slower', 'decrease speed']
  },
  {
    command: 'cube',
    action: 'object-cube',
    examples: ['cube', 'show cube', 'change to cube']
  },
  {
    command: 'sphere',
    action: 'object-sphere',
    examples: ['sphere', 'show sphere', 'change to sphere', 'ball']
  },
  {
    command: 'torus',
    action: 'object-torus',
    examples: ['torus', 'show torus', 'change to torus', 'donut', 'ring']
  },
  {
    command: 'screenshot',
    action: 'screenshot',
    examples: ['screenshot', 'capture', 'take photo', 'snap']
  },
  {
    command: 'fullscreen',
    action: 'fullscreen',
    examples: ['fullscreen', 'full screen', 'maximize']
  },
  {
    command: 'colors',
    action: 'next-color',
    examples: ['change color', 'next color', 'different color', 'colors']
  },
  {
    command: 'wireframe',
    action: 'toggle-wireframe',
    examples: ['wireframe', 'toggle wireframe', 'show wireframe', 'hide wireframe']
  },
  {
    command: 'glow',
    action: 'toggle-glow',
    examples: ['glow', 'more glow', 'increase glow', 'brighter']
  },
  {
    command: 'randomize',
    action: 'randomize',
    examples: ['randomize', 'random', 'surprise me', 'shuffle']
  },
  {
    command: 'reset',
    action: 'reset',
    examples: ['reset', 'reset camera', 'center']
  }
]

interface VoiceControlsProps {
  onCommand: (action: string) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function VoiceControls({ onCommand, enabled, onEnabledChange }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onend = () => {
        setIsListening(false)
        if (enabled && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log('Recognition restart prevented:', e)
          }
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          return
        }
        setIsListening(false)
        if (event.error !== 'aborted') {
          toast.error(`Voice error: ${event.error}`)
        }
      }
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript.toLowerCase().trim()
        
        setTranscript(transcriptText)
        
        if (event.results[current].isFinal) {
          processVoiceCommand(transcriptText)
          setTimeout(() => setTranscript(''), 3000)
        }
      }
      
      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Recognition cleanup prevented:', e)
        }
      }
    }
  }, [enabled])

  const processVoiceCommand = (text: string) => {
    for (const cmd of VOICE_COMMANDS) {
      for (const example of cmd.examples) {
        if (text.includes(example)) {
          onCommand(cmd.action)
          toast.success(`✓ ${cmd.command}`, { duration: 1500 })
          return
        }
      }
    }
    
    toast.error('Command not recognized')
  }

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return
    
    try {
      recognitionRef.current.start()
      onEnabledChange(true)
      toast.success('Voice controls activated')
    } catch (e) {
      console.error('Failed to start recognition:', e)
      toast.error('Failed to start voice recognition')
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    
    try {
      recognitionRef.current.stop()
      onEnabledChange(false)
      setIsListening(false)
      toast.info('Voice controls deactivated')
    } catch (e) {
      console.error('Failed to stop recognition:', e)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {isExpanded && (
        <div className="glass-panel border-t-2 border-primary/50 bg-black/95 backdrop-blur-md p-4 shadow-[0_-8px_30px_rgba(var(--primary),0.2)] animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Info size={16} />
                Voice Command Reference
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {VOICE_COMMANDS.map((cmd) => (
                <div 
                  key={cmd.command}
                  className="p-2 rounded-lg bg-secondary/20 border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <Badge variant="secondary" className="mb-1 text-[10px] font-bold">
                    {cmd.command}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground">
                    "{cmd.examples[0]}"
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 Speak naturally - the system understands multiple variations of each command
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel border-t-2 border-primary/50 bg-black/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(var(--primary),0.3)]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Microphone 
              className={isListening ? 'text-accent animate-pulse' : 'text-muted-foreground'} 
              size={20}
              weight={isListening ? 'fill' : 'regular'}
            />
            <span className="text-sm font-semibold whitespace-nowrap hidden sm:inline">Voice Commands</span>

            {enabled && isListening && (
              <>
                <div className="hidden sm:block h-4 w-px bg-primary/30" />
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-accent whitespace-nowrap hidden md:inline">Listening...</span>
                </div>
              </>
            )}

            {transcript && (
              <>
                <div className="hidden md:block h-4 w-px bg-primary/30" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    "{transcript}"
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {enabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                {isExpanded ? 'Hide' : 'Help'}
              </Button>
            )}
            
            <Button
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              onClick={enabled ? stopListening : startListening}
              className={enabled 
                ? 'bg-accent text-accent-foreground holographic-glow' 
                : 'border-primary/50 hover:border-primary hover:bg-primary/10'
              }
            >
              {enabled ? (
                <>
                  <Stop size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Microphone size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Start</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
