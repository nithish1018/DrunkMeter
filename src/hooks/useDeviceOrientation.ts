import { useEffect, useMemo, useState } from 'react'

type OrientationPermission = 'unknown' | 'granted' | 'denied' | 'unsupported'

export const useDeviceOrientation = (isTracking: boolean) => {
  const [gamma, setGamma] = useState<number | null>(null)
  const [permissionState, setPermissionState] =
    useState<OrientationPermission>('unknown')

  const isSupported = useMemo(
    () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    [],
  )

  const requestPermission = async () => {
    if (!isSupported) {
      setPermissionState('unsupported')
      return false
    }

    const iOSPermissionMethod = (
      DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
    ).requestPermission

    if (!iOSPermissionMethod) {
      setPermissionState('granted')
      return true
    }

    try {
      const response = await iOSPermissionMethod()
      const granted = response === 'granted'
      setPermissionState(granted ? 'granted' : 'denied')
      return granted
    } catch {
      setPermissionState('denied')
      return false
    }
  }

  useEffect(() => {
    if (!isTracking || permissionState !== 'granted') return

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.gamma === 'number') {
        setGamma(event.gamma)
      }
    }

    window.addEventListener('deviceorientation', onOrientation)
    return () => window.removeEventListener('deviceorientation', onOrientation)
  }, [isTracking, permissionState])

  return {
    gamma,
    isSupported,
    permissionState,
    requestPermission,
  }
}
