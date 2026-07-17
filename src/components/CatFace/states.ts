import type { StateDefinition } from './types';

export const ALL_STATES: StateDefinition[] = [
  // ── 1. IDLE ──────────────────────────────────────────────────────────────
  {
    id: 'idle',
    label: 'Idle',
    emoji: '😶',
    emotion: 'Calm and present — resting but quietly alert',
    feeling: 'I\'m here whenever you need me.',
    uxReason: 'Default resting state. The mascot reassures the user it is ready without demanding attention. Breathing and occasional blinks keep it feeling alive, not frozen.',
    trigger: 'App is open with no active task, timer, or input',
    animationClass: 'cat-state-idle',
    duration: '5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is idle and ready.',
  },

  // ── 2. GREETING ───────────────────────────────────────────────────────────
  {
    id: 'greeting',
    label: 'Greeting',
    emoji: '☀️',
    emotion: 'Warm welcome — happy eyes, gentle nod',
    feeling: 'Welcome back.',
    uxReason: 'Morning or first-open greeting. A subtle nod with happy squinted eyes signals warmth without being loud. Transitions automatically to idle after ~5s.',
    trigger: 'User opens the app for the first time that day',
    animationClass: 'cat-state-greeting',
    duration: '2.5s',
    easing: 'cubic-bezier(0.34,1.2,0.64,1)',
    loop: false,
    accessibilityHint: 'Mascot is greeting you.',
  },

  // ── 3. PLANNING ───────────────────────────────────────────────────────────
  {
    id: 'planning',
    label: 'Planning',
    emoji: '📋',
    emotion: 'Scanning, calculating — eyes moving systematically',
    feeling: 'Let\'s organize today.',
    uxReason: 'User is in planning mode creating tasks or schedules. The sweeping pupil gaze mirrors strategic, analytical thinking.',
    trigger: 'Task planning view open / calendar being built',
    animationClass: 'cat-state-planning',
    duration: '2.8s',
    easing: 'cubic-bezier(0.37,0,0.63,1)',
    loop: true,
    accessibilityHint: 'Mascot is in planning mode.',
  },

  // ── 4. WRITING ────────────────────────────────────────────────────────────
  {
    id: 'writing',
    label: 'Writing',
    emoji: '✍️',
    emotion: 'Intent, downward gaze — absorbed in the page',
    feeling: 'I\'m writing this down.',
    uxReason: 'User is in a writing session. Downward pupils and whisker flutter communicate absorbed creative focus without distraction.',
    trigger: 'Writing mode active / note editor focused with sustained input',
    animationClass: 'cat-state-writing',
    duration: '2.2s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is in writing mode.',
  },

  // ── 5. THINKING ───────────────────────────────────────────────────────────
  {
    id: 'thinking',
    label: 'Thinking',
    emoji: '🤔',
    emotion: 'Mild concentration — pupils drifting upward, slight squint',
    feeling: 'Let me think.',
    uxReason: 'AI is processing a complex request. Upward pupils signal internal computation without stressing the user. One eye squints — a classic feline thinking expression.',
    trigger: 'AI/LLM request in flight, complex calculation processing',
    animationClass: 'cat-state-thinking',
    duration: '5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is thinking.',
  },

  // ── 6. FOCUSED ────────────────────────────────────────────────────────────
  {
    id: 'focused',
    label: 'Focus',
    emoji: '🎯',
    emotion: 'Deep concentration — narrowed eyes, contracted pupils',
    feeling: 'Let\'s focus.',
    uxReason: 'Active focus session. Narrowed eyes communicate "do not disturb" without being aggressive. Slow breathing maintains the calm.',
    trigger: 'Focus mode or Pomodoro timer is active',
    animationClass: 'cat-state-focused',
    duration: '9s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Focus mode is active.',
  },

  // ── 7. REMINDER ───────────────────────────────────────────────────────────
  {
    id: 'reminder',
    label: 'Reminder',
    emoji: '🔔',
    emotion: 'Gentle alert — double blink, soft glow, ears perk',
    feeling: 'Don\'t forget.',
    uxReason: 'A reminder fires. Eyes blink twice and a subtle glow pulse draws attention without jarring the user. Softer than error, warmer than countdown.',
    trigger: 'Scheduled reminder or notification fires',
    animationClass: 'cat-state-reminder',
    duration: '2.5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'You have a reminder.',
  },

  // ── 8. COUNTDOWN ──────────────────────────────────────────────────────────
  {
    id: 'urgent',
    label: 'Urgent Reminder',
    emotion: 'Frantic',
    uxReason: 'Less than 1 minute remaining.',
    trigger: 'Timer is near zero',
    animationClass: 'cat-state-urgent',
    duration: '0.08s',
    easing: 'linear',
    loop: true,
    emoji: '⏰',
    feeling: 'Alarmed',
    accessibilityHint: 'Mascot is frantically waving and pointing at a ringing alarm clock.'
  },
  {
    id: 'countdown',
    label: 'Countdown',
    emoji: '⏳',
    emotion: 'Widening anticipation — pupils dilating as time runs out',
    feeling: 'Almost time.',
    uxReason: 'Timer is about to expire. Gradually dilating pupils and a quickening glow pulse create a sense of growing urgency without alarm.',
    trigger: 'Less than 10 minutes remaining on a task timer',
    animationClass: 'cat-state-countdown',
    duration: '3s',
    easing: 'ease-out',
    loop: false,
    accessibilityHint: 'Time is almost up.',
  },

  // ── 9. SUCCESS ────────────────────────────────────────────────────────────
  {
    id: 'success',
    label: 'Success',
    emoji: '✅',
    emotion: 'Quiet satisfaction — warm squint, tiny bounce, cheek blush',
    feeling: 'Great job!',
    uxReason: 'Task completed. A single restrained bounce with happy-squint eyes and a cheek blush communicates achievement without excess fanfare.',
    trigger: 'Task or timer completed successfully',
    animationClass: 'cat-state-success',
    duration: '0.65s',
    easing: 'cubic-bezier(0.34,1.56,0.64,1)',
    loop: false,
    accessibilityHint: 'Task completed successfully.',
  },

  // ── 10. CELEBRATION ───────────────────────────────────────────────────────
  {
    id: 'celebration',
    label: 'Celebration',
    emoji: '🎉',
    emotion: 'Joyful — bouncing, ears twitching, squinting with delight',
    feeling: 'You finished everything today!',
    uxReason: 'Major milestone or daily goal completed. More energetic than success, but still minimal and premium. Reserved for genuinely celebratory moments.',
    trigger: 'All tasks completed, goal hit, or streak milestone',
    animationClass: 'cat-state-celebration',
    duration: '0.9s',
    easing: 'cubic-bezier(0.34,1.4,0.64,1)',
    loop: true,
    accessibilityHint: 'Celebrating your achievement.',
  },

  // ── 11. SLEEPING ──────────────────────────────────────────────────────────
  {
    id: 'sleeping',
    label: 'Sleeping',
    emoji: '😴',
    emotion: 'Fully at rest — eyes gently closed, slow breathing, tiny Z',
    feeling: 'Time to rest.',
    uxReason: 'No remaining tasks or user inactive. Eyes close fully, tiny Z floats upward. Signals the system is resting, not broken.',
    trigger: 'No remaining tasks or user inactivity exceeds sleep timeout',
    animationClass: 'cat-state-sleeping',
    duration: '4s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is sleeping.',
  },

  // ── 12. WAITING ───────────────────────────────────────────────────────────
  {
    id: 'waiting',
    label: 'Waiting',
    emoji: '🕐',
    emotion: 'Patient, quiet anticipation — gaze drifting, ear twitch',
    feeling: 'I\'m listening.',
    uxReason: 'Something is pending — a response, a load, a user action. The mascot waits alongside the user without urgency.',
    trigger: 'Awaiting user input, API response, or pending user decision',
    animationClass: 'cat-state-waiting',
    duration: '7.5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Waiting for your input.',
  },

  // ── 12.5. BRB ─────────────────────────────────────────────────────────────
  {
    id: 'brb',
    label: 'BRB (Away)',
    emoji: '🪧',
    emotion: 'Resting with a sign — closed eyes, holding a wooden sign',
    feeling: 'Be Right Back.',
    uxReason: 'User is AFK. The mascot holds up a BRB sign and closes its eyes, showing that the system is safely paused and waiting for their return.',
    trigger: 'Global idle detection or tab hidden for an extended period',
    animationClass: 'cat-state-brb',
    duration: '6s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is holding a BRB sign while you are away.',
  },

  // ── 13. SEARCHING ─────────────────────────────────────────────────────────
  {
    id: 'searching',
    label: 'Searching',
    emoji: '🔍',
    emotion: 'Darting, scanning — rapid pupil saccades left and right',
    feeling: 'Looking for it...',
    uxReason: 'Search is running. Fast pupil sweeps mirror the act of scanning through results without a loading bar.',
    trigger: 'Search query in flight / indexing in progress',
    animationClass: 'cat-state-searching',
    duration: '0.85s',
    easing: 'cubic-bezier(0.4,0,0.2,1)',
    loop: true,
    accessibilityHint: 'Searching...',
  },

  // ── 14. READING ───────────────────────────────────────────────────────────
  {
    id: 'reading',
    label: 'Reading',
    emoji: '📖',
    emotion: 'Calm, measured — eyes track left steadily then reset',
    feeling: 'I\'m reading.',
    uxReason: 'User is reading a document. Steady left-tracking pupils mirror the natural reading eye-movement pattern.',
    trigger: 'Reading mode active / long document open',
    animationClass: 'cat-state-reading',
    duration: '3s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Reading mode active.',
  },

  // ── 15. SYNCING ───────────────────────────────────────────────────────────
  {
    id: 'syncing',
    label: 'Syncing',
    emoji: '☁️',
    emotion: 'Calm, methodical — soft glow pulse with gentle pupil sweep',
    feeling: 'Keeping everything updated.',
    uxReason: 'Cloud sync in progress. The glow pulse communicates active network activity without urgency. Calmer than loading — this is background maintenance.',
    trigger: 'Cloud sync operation in progress',
    animationClass: 'cat-state-syncing',
    duration: '3s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Syncing data.',
  },

  // ── 16. CONFUSED ──────────────────────────────────────────────────────────
  {
    id: 'confused',
    label: 'Confused',
    emoji: '😕',
    emotion: 'Puzzled — head tilt, asymmetric eyes, one ear drooping',
    feeling: 'Hmm...',
    uxReason: 'Non-critical parse error or ambiguous input. Head tilt + mismatched eyes + drooping ear signal confusion without panic.',
    trigger: 'Unexpected input, ambiguous command, or non-critical parse error',
    animationClass: 'cat-state-confused',
    duration: '3.5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is confused. Please clarify.',
  },

  // ── 17. ENCOURAGING ───────────────────────────────────────────────────────
  {
    id: 'encouraging',
    label: 'Encouraging',
    emoji: '💪',
    emotion: 'Warm, uplifting — happy eyes, gentle nod',
    feeling: 'Welcome back. Let\'s continue.',
    uxReason: 'User returns after being inactive. A gentle nod with happy squinted eyes signals warmth and readiness to resume.',
    trigger: 'User returns after inactivity or resumes after break',
    animationClass: 'cat-state-encouraging',
    duration: '2.8s',
    easing: 'cubic-bezier(0.34,1.2,0.64,1)',
    loop: false,
    accessibilityHint: 'Welcome back.',
  },

  // ── 18. COFFEE-BREAK ──────────────────────────────────────────────────────
  {
    id: 'coffee-break',
    label: 'Coffee Break',
    emoji: '☕',
    emotion: 'Drowsy but content — heavy half-blinks',
    feeling: 'Enjoy your break.',
    uxReason: 'User manually triggered a break. Different from sleeping — the mascot is still semi-aware, just relaxed.',
    trigger: 'User starts a break timer or clicks "Take a break"',
    animationClass: 'cat-state-coffee-break',
    duration: '6s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Break mode active.',
  },

  // ── 19. TYPING ────────────────────────────────────────────────────────────
  {
    id: 'typing',
    label: 'Typing',
    emoji: '⌨️',
    emotion: 'Focused downward — watching the work happen',
    feeling: 'I\'m writing this down.',
    uxReason: 'User is actively typing. Downcast pupils mirror the act of looking at your own hands on a keyboard.',
    trigger: 'Keyboard input detected in a text editor field',
    animationClass: 'cat-state-typing',
    duration: '2s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Typing mode active.',
  },

  // ── 20. MEETING ───────────────────────────────────────────────────────────
  {
    id: 'meeting',
    label: 'Meeting',
    emoji: '📹',
    emotion: 'Attentive, wide-eyed, minimal blinking',
    feeling: 'Staying attentive.',
    uxReason: 'User is in a meeting or call. Wide alert eyes with slow blinks signal professional engagement.',
    trigger: 'Calendar event start / video call detected',
    animationClass: 'cat-state-meeting',
    duration: '7s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Meeting mode active.',
  },

  // ── 21. LOADING ───────────────────────────────────────────────────────────
  {
    id: 'loading',
    label: 'Loading',
    emoji: '⏳',
    emotion: 'Methodical — pupils sweeping side to side with a soft glow',
    feeling: 'One moment...',
    uxReason: 'Background operation in progress. Purposeful sweep animation communicates progress without a spinner.',
    trigger: 'File upload, data fetch, or background operation in progress',
    animationClass: 'cat-state-loading',
    duration: '1.6s',
    easing: 'cubic-bezier(0.4,0,0.2,1)',
    loop: true,
    accessibilityHint: 'Loading...',
  },

  // ── 22. OFFLINE ───────────────────────────────────────────────────────────
  {
    id: 'offline',
    label: 'Offline',
    emoji: '📴',
    emotion: 'Dimmed, distant — the mascot fades with connectivity',
    feeling: 'Offline.',
    uxReason: 'No network connection. The pulsing dim communicates reduced capability without alarming the user.',
    trigger: 'Network offline event detected',
    animationClass: 'cat-state-offline',
    duration: '4s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'You are offline.',
  },

  // ── 23. ERROR ─────────────────────────────────────────────────────────────
  {
    id: 'error',
    label: 'Error',
    emoji: '⚠️',
    emotion: 'Sharp, alert — quick double blink signals urgency',
    feeling: 'Something went wrong.',
    uxReason: 'Critical error state. Double blink draws attention without being as aggressive as a red flash. Ears perk up to signal heightened alertness.',
    trigger: 'Unhandled exception, critical API failure, or data loss risk',
    animationClass: 'cat-state-error',
    duration: '3.5s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'An error occurred.',
  },

  // ── 24. LISTENING ─────────────────────────────────────────────────────────
  {
    id: 'listening',
    label: 'Listening',
    emoji: '👂',
    emotion: 'Alert, perked up, fully attentive — wide eyes, active whiskers',
    feeling: 'I\'m listening.',
    uxReason: 'User is speaking or dictating. Wide eyes and perked ears signal active reception.',
    trigger: 'Microphone input detected / voice command active',
    animationClass: 'cat-state-listening',
    duration: '3s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Listening for voice input.',
  },

  // ── 25. HAPPY ─────────────────────────────────────────────────────────────
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    emotion: 'Warmly content — soft eye squint, cheek blush, gentle ear twitches',
    feeling: 'All is well.',
    uxReason: 'Positive reinforcement. Streak continues, daily goal met. Warmer and longer-lasting than success.',
    trigger: 'Daily goal met, positive streak, or user-initiated happy mood',
    animationClass: 'cat-state-happy',
    duration: '3s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Mascot is happy.',
  },
  
  // ── 26. AHA ───────────────────────────────────────────────────────────────
  {
    id: 'aha',
    label: 'Aha!',
    emoji: '💡',
    emotion: 'Puzzled breakthrough — happy eyes, lightbulb, bounce',
    feeling: 'I figured it out!',
    uxReason: 'Thinking resolved successfully. The lightbulb pops up above the head.',
    trigger: 'Problem solved or thinking complete',
    animationClass: 'cat-state-aha',
    duration: '2s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Aha! Thinking solved.',
  },
  
  // ── 27. WAKING ─────────────────────────────────────────────────────────────
  {
    id: 'waking',
    label: 'Waking Up',
    emoji: '⏰',
    emotion: 'Startled wake — bubble pops, eyes open wide, scratches eye',
    feeling: 'Huh! What happened?',
    uxReason: 'Mascot is startled awake from sleeping state.',
    trigger: 'User interacts with sleeping mascot',
    animationClass: 'cat-state-waking',
    duration: '3.5s',
    easing: 'ease-in-out',
    loop: false,
    accessibilityHint: 'Mascot is waking up.',
  },

  // ── 28. BREAK ──────────────────────────────────────────────────────────────
  {
    id: 'break',
    label: 'Break',
    emoji: '☕',
    emotion: 'Relaxed, smiling — sipping tea/coffee, gazing out the window',
    feeling: 'พักสักหน่อย เดี๋ยวค่อยลุยต่อ',
    uxReason: 'User manually triggered a break from Focus mode. Keyboard and notebook quietly transition out. A coffee cup appears. The mascot looks peaceful and content.',
    trigger: 'User pauses active focus session',
    animationClass: 'cat-state-break',
    duration: '8s',
    easing: 'ease-in-out',
    loop: true,
    accessibilityHint: 'Break mode active. Time to rest.',
  },
];

export const STATE_MAP = new Map(ALL_STATES.map((s) => [s.id, s]));

export function getStateDefinition(id: string): StateDefinition {
  return STATE_MAP.get(id as any) ?? ALL_STATES[0];
}
