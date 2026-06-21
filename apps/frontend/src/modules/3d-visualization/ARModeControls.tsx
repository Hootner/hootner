import { useState, useEffect } from 'react'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { DeviceMobile, Compass, Crosshair, ArrowCounterClockwise, Info, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ARModeControlsProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  sensitivity: number
  onSensitivityChange: (value: number) => void
  smoothing: number
  onSmoothingChange: (value: number) => void
  lockRotation: boolean
  onLockRotationChange: (enabled: boolean) => void
  onCalibrate: () => void
  onReset: () => void
}

export function ARModeControls({
  enabled,
  onEnabledChange,
  sensitivity,
  onSensitivityChange,
  smoothing,
  onSmoothingChange,
  lockRotation,
  onLockRotationChange,
  onCalibrate,
  onReset
}: ARModeControlsProps) {
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('unsupported')
  const [isCalibrating, setIsCalibrating] = useState(false)

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionStatus('prompt')
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      setPermissionStatus('granted')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [enabled])

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        setPermissionStatus(permission)
        if (permission === 'granted') {
          onEnabledChange(true)
          toast.success('Device orientation access granted!')
        } else {
          toast.error('Device orientation access denied')
        }
      } catch (error) {
        toast.error('Failed to request device orientation permission')
      }
    } else {
      onEnabledChange(true)
    }
  }

  const handleCalibrate = () => {
    setIsCalibrating(true)
    onCalibrate()
    setTimeout(() => {
      setIsCalibrating(false)
      toast.success('AR mode calibrated to current device position')
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-3 text-primary flex items-center gap-2">
          <DeviceMobile className="animate-pulse" />
          AR/XR MODE
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/50 holographic-glow">
            <p className="text-sm font-semibold text-accent mb-2">📱 Augmented Reality Controls</p>
            <p className="text-xs text-muted-foreground">
              Use your device's gyroscope and accelerometer to control the hologram by moving your device in real space
            </p>
          </div>

          {permissionStatus === 'unsupported' && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <Warning className="h-4 w-4" />
              <AlertTitle>Device Not Supported</AlertTitle>
              <AlertDescription className="text-xs">
                Your device doesn't support orientation sensors. AR mode requires a mobile device with gyroscope and accelerometer.
              </AlertDescription>
            </Alert>
          )}

          {permissionStatus === 'denied' && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <Warning className="h-4 w-4" />
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription className="text-xs">
                Device orientation access was denied. Please enable it in your device settings to use AR mode.
              </AlertDescription>
            </Alert>
          )}

          {permissionStatus === 'prompt' && !enabled && (
            <Alert className="border-accent/50 bg-accent/10">
              <Info className="h-4 w-4" />
              <AlertTitle>Permission Required</AlertTitle>
              <AlertDescription className="text-xs mb-2">
                AR mode requires access to your device's motion sensors. This is safe and only used while the app is open.
              </AlertDescription>
              <Button
                onClick={requestPermission}
                className="mt-2 bg-accent text-accent-foreground holographic-glow"
                size="sm"
              >
                <DeviceMobile className="mr-2" size={16} />
                Enable AR Mode
              </Button>
            </Alert>
          )}

          {permissionStatus !== 'unsupported' && permissionStatus !== 'denied' && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="ar-enabled" className="text-sm">
                  Enable AR Mode
                </Label>
                <Switch
                  id="ar-enabled"
                  checked={enabled}
                  onCheckedChange={permissionStatus === 'prompt' ? requestPermission : onEnabledChange}
                />
              </div>

              {enabled && (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Compass className="animate-spin" style={{ animationDuration: '4s' }} />
                      AR Mode Active
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Move your device to control the hologram orientation in real-time
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded bg-secondary/30">
                        <div className="text-muted-foreground mb-1">Alpha</div>
                        <div className="font-mono font-bold">{deviceOrientation.alpha.toFixed(0)}°</div>
                      </div>
                      <div className="p-2 rounded bg-secondary/30">
                        <div className="text-muted-foreground mb-1">Beta</div>
                        <div className="font-mono font-bold">{deviceOrientation.beta.toFixed(0)}°</div>
                      </div>
                      <div className="p-2 rounded bg-secondary/30">
                        <div className="text-muted-foreground mb-1">Gamma</div>
                        <div className="font-mono font-bold">{deviceOrientation.gamma.toFixed(0)}°</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ar-sensitivity" className="text-sm">
                        Sensitivity
                      </Label>
                      <Badge variant="secondary" className="font-mono">
                        {sensitivity.toFixed(1)}x
                      </Badge>
                    </div>
                    <Slider
                      id="ar-sensitivity"
                      value={[sensitivity]}
                      onValueChange={(values) => onSensitivityChange(values[0])}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls how responsive the hologram is to device movement
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ar-smoothing" className="text-sm">
                        Motion Smoothing
                      </Label>
                      <Badge variant="secondary" className="font-mono">
                        {Math.round(smoothing * 100)}%
                      </Badge>
                    </div>
                    <Slider
                      id="ar-smoothing"
                      value={[smoothing]}
                      onValueChange={(values) => onSmoothingChange(values[0])}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Reduces jitter and creates smoother motion transitions
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="lock-rotation" className="text-sm">
                        Lock Y-Axis Rotation
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent spinning around vertical axis
                      </p>
                    </div>
                    <Switch
                      id="lock-rotation"
                      checked={lockRotation}
                      onCheckedChange={onLockRotationChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCalibrate}
                      disabled={isCalibrating}
                      className="border-accent/50 hover:border-accent hover:bg-accent/10"
                    >
                      {isCalibrating ? (
                        <>
                          <Compass className="mr-2 animate-spin" size={16} />
                          Calibrating...
                        </>
                      ) : (
                        <>
                          <Crosshair className="mr-2" size={16} />
                          Calibrate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onReset}
                      className="border-primary/50 hover:border-primary hover:bg-primary/10"
                    >
                      <ArrowCounterClockwise className="mr-2" size={16} />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
        <h3 className="text-sm font-bold mb-2">About AR Mode</h3>
        <p className="text-xs text-muted-foreground mb-2">
          AR (Augmented Reality) mode uses your device's motion sensors to create an immersive viewing experience. 
          The hologram responds to how you move and rotate your device in real space.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>Alpha:</strong> Rotation around Z-axis (compass direction)</li>
          <li><strong>Beta:</strong> Rotation around X-axis (tilt forward/back)</li>
          <li><strong>Gamma:</strong> Rotation around Y-axis (tilt left/right)</li>
          <li><strong>Calibration:</strong> Sets current position as neutral reference</li>
        </ul>
        <p className="text-xs text-accent mt-2 font-semibold">
          💡 Best experienced on mobile devices with gyroscope support
        </p>
      </div>
    </div>
  )
}
