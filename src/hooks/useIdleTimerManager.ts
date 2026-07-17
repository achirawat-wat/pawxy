import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';

declare global {
  interface Window {
    IdleDetector?: any;
  }
}

export function useIdleTimerManager(
  isEnabled: boolean,
  onIdle: () => void,
  onActive: () => void,
  thresholdMs = 180000 // default 3 minutes
) {
  const [isIdle, setIsIdle] = useState(false);
  const [permission, setPermission] = useState<PermissionState | 'unsupported'>('prompt');
  
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);
  const afkStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    onIdleRef.current = onIdle;
    onActiveRef.current = onActive;
  }, [onIdle, onActive]);

  // Handle actual state change and triggers
  const handleStateChange = useCallback((newState: 'idle' | 'active') => {
    setIsIdle(prev => {
      if (prev === (newState === 'idle')) return prev;
      
      if (newState === 'idle') {
        afkStartTimeRef.current = Date.now();
        onIdleRef.current();
        return true;
      } else {
        if (afkStartTimeRef.current) {
          const afkSeconds = Math.floor((Date.now() - afkStartTimeRef.current) / 1000);
          useStore.getState().addAfkTime(afkSeconds);
          afkStartTimeRef.current = null;
        }
        onActiveRef.current();
        return false;
      }
    });
  }, []);

  // Permission setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!('IdleDetector' in window)) {
      setPermission('unsupported');
      return;
    }

    // Try to query existing permission silently without prompting
    const checkPermission = async () => {
      try {
        const state = await navigator.permissions.query({ name: 'idle-detection' as any });
        setPermission(state.state);
        state.addEventListener('change', () => {
          setPermission(state.state);
        });
      } catch (e) {
        console.warn("Could not query idle-detection permission", e);
      }
    };
    checkPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('IdleDetector' in window)) return true; // Fallback will be used, no permission needed
    
    try {
      const state = await window.IdleDetector.requestPermission();
      setPermission(state);
      return state === 'granted';
    } catch (e) {
      console.error("Failed to request IdleDetector permission:", e);
      return false;
    }
  };

  // Modern IdleDetector effect
  useEffect(() => {
    if (!isEnabled || permission !== 'granted' || !('IdleDetector' in window)) {
      return;
    }

    let abortController = new AbortController();
    let detector: any = null;

    const startDetector = async () => {
      try {
        detector = new window.IdleDetector();
        detector.addEventListener('change', () => {
          const state = detector.userState;
          if (state === 'idle') {
            handleStateChange('idle');
          } else if (state === 'active') {
            handleStateChange('active');
          }
        });

        await detector.start({
          threshold: Math.max(60000, thresholdMs), // Must be at least 1 min
          signal: abortController.signal,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("IdleDetector start error:", err);
        }
      }
    };

    startDetector();

    return () => {
      abortController.abort();
    };
  }, [isEnabled, permission, thresholdMs, handleStateChange]);

  // Fallback Effect for Safari/Firefox or when permission is denied
  useEffect(() => {
    if (!isEnabled || permission === 'granted') {
      // If native IdleDetector is granted and enabled, don't use fallback
      return;
    }

    let idleTimeout: NodeJS.Timeout;

    const resetIdle = () => {
      handleStateChange('active');
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        handleStateChange('idle');
      }, thresholdMs);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) resetIdle();
    };

    // Attach global events
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    window.addEventListener('click', resetIdle, { passive: true });
    window.addEventListener('scroll', resetIdle, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Trigger initial
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(idleTimeout);
    };
  }, [isEnabled, permission, thresholdMs, handleStateChange]);

  return { isIdle, permission, requestPermission };
}
