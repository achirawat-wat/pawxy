// ─────────────────────────────────────────────────────────────────────────────
// CatFace Mascot System — Types v2.0
// ─────────────────────────────────────────────────────────────────────────────

export type CatFaceState =
  | 'idle'
  | 'greeting'
  | 'waiting'
  | 'listening'
  | 'thinking'
  | 'focused'
  | 'planning'
  | 'typing'
  | 'reminder'
  | 'urgent'
  | 'countdown'
  | 'success'
  | 'celebration'
  | 'sleeping'
  | 'coffee-break'
  | 'confused'
  | 'searching'
  | 'reading'
  | 'writing'
  | 'meeting'
  | 'loading'
  | 'syncing'
  | 'offline'
  | 'error'
  | 'happy'
  | 'encouraging'
  | 'aha'
  | 'waking'
  | 'break'
  | 'brb';

export type CatFaceSize = number;

export interface CatFaceProps {
  /** The current emotional state of the mascot */
  state?: CatFaceState;
  /** Render size in px — mascot scales cleanly at all values */
  size?: CatFaceSize;
  /** Optional aria-label override */
  label?: string;
  /** Callback fired after a state transition animation completes */
  onStateChange?: (from: CatFaceState, to: CatFaceState) => void;
  /** Additional className on the root wrapper */
  className?: string;
}

export interface StateDefinition {
  /** Unique state key */
  id: CatFaceState;
  /** Human-readable label */
  label: string;
  /** Short emotion description */
  emotion: string;
  /** Why this state exists in a UX context */
  uxReason: string;
  /** What event triggers this state */
  trigger: string;
  /** CSS animation class(es) applied to the SVG root element */
  animationClass: string;
  /** Primary animation duration */
  duration: string;
  /** Primary animation easing */
  easing: string;
  /** Whether the animation loops */
  loop: boolean;
  /** Emoji used in the showcase UI */
  emoji: string;
  /** The feeling conveyed — short copy for tooltips / accessible descriptions */
  feeling: string;
  /** Recommended accessibility announcement */
  accessibilityHint: string;
}

export interface EyeAnimState {
  scaleY: number;       // 0 = closed, 1 = fully open
  scaleX: number;       // pupil width modifier
  translateX: number;   // pupil horizontal shift
  translateY: number;   // pupil vertical shift
}

export interface CatFaceIdleConfig {
  /** Milliseconds of inactivity before switching to sleeping */
  sleepTimeout?: number;
}
