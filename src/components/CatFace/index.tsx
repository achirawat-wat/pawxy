'use client';

import React, { useRef, useEffect } from 'react';

import { CatFaceSVG } from './CatFaceSVG';
import { getStateDefinition } from './states';
import type { CatFaceProps, CatFaceState } from './types';

// Import styles
import './styles/tokens.css';
import './styles/catface.css';

const SIZE_MAP: Record<number, number> = {
  24: 24,
  32: 32,
  48: 48,
  64: 64,
  128: 128,
};

/**
 * CatFace — minimalist kitten mascot component.
 *
 * @example
 * <CatFace state="idle"        size={64}  theme="dark" />
 * <CatFace state="sleeping"    size={128} />
 * <CatFace state="celebration" size={48}  theme="light" />
 * <CatFace state="thinking"    size={32}  theme="auto" label="AI is thinking..." />
 */
export function CatFace({
  state = 'idle',
  size = 64,
  label,
  onStateChange,
  className = '',
}: CatFaceProps) {
  const prevStateRef = useRef<CatFaceState>(state);
  const stateDefinition = getStateDefinition(state);
  const px = size; // Support any custom sizing directly

  useEffect(() => {
    if (prevStateRef.current !== state) {
      onStateChange?.(prevStateRef.current, state);
      prevStateRef.current = state;
    }
  }, [state, onStateChange]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state !== 'searching' && state !== 'planning') {
      if (wrapperRef.current) {
        wrapperRef.current.style.removeProperty('--pupil-x');
        wrapperRef.current.style.removeProperty('--pupil-y');
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Limit pupil movement radius
      const maxMove = 12;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      let moveX = deltaX;
      let moveY = deltaY;
      
      if (distance > maxMove) {
        moveX = (deltaX / distance) * maxMove;
        moveY = (deltaY / distance) * maxMove;
      }
      
      wrapperRef.current.style.setProperty('--pupil-x', `${moveX}px`);
      wrapperRef.current.style.setProperty('--pupil-y', `${moveY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  const ariaLabel =
    label ?? stateDefinition.accessibilityHint ?? `Cat mascot — ${stateDefinition.label}`;

  return (
    <div
      ref={wrapperRef}
      className={`catface-wrapper ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={ariaLabel}
    >
      <CatFaceSVG
        size={size}
        animationClass={stateDefinition.animationClass}
      />
    </div>
  );
}

// State-specific components for easier re-use
export function CatFaceIdle(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="idle" />;
}

export function CatFaceTyping(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="typing" />;
}

export function CatFaceThinking(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="thinking" />;
}

export function CatFaceAha(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="aha" />;
}

export function CatFaceSleeping(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="sleeping" />;
}

export function CatFaceWaking(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="waking" />;
}

export function CatFaceFocused(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="focused" />;
}

export function CatFaceBreak(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="break" />;
}

export function CatFaceCelebration(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="celebration" />;
}

export function CatFaceUrgent(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="urgent" />;
}

export function CatFaceBRB(props: Omit<CatFaceProps, 'state'>) {
  return <CatFace {...props} state="brb" />;
}

// Named exports for convenience
export type { CatFaceProps } from './types';
export { ALL_STATES, getStateDefinition } from './states';
