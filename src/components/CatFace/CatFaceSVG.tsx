"use client";

import React, { useId } from "react";

export interface CatFaceSVGProps {
  size?: number;
  theme?: 'light' | 'dark' | 'auto';
  showFace?: boolean;
  className?: string;
  label?: string;
  animationClass?: string;
}

const PALETTE = {
  fur: "#FFFFFF",
  outline: "#82899A",
  earOuter: "#FFFFFF",
  earInner: "#FCAEBE",
  eye: "#3A3F4A",
  eyeHighlight: "#FFFFFF",
  nose: "#F9A8B7",
  mouth: "#82899A",
  whisker: "#82899A",
  blush: "#FBE3E7",
  paw: "#FFFFFF",
};

export function CatFaceSVG({
  size = 240,
  theme = 'auto',
  showFace = false,
  className,
  label = "Kitten mascot",
  animationClass,
}: CatFaceSVGProps) {
  const rawId = useId();
  const uid = `kf-${rawId.replace(/[:]/g, "")}`;

  return (
    <div
      className={[uid, "kf-root", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, lineHeight: 0 }}
      role="img"
      aria-label={label}
    >
      <style>{`
        .${uid}.kf-root { display: inline-block; }
        .${uid} .kf-svg { width: 100%; height: 100%; overflow: visible; }
      `}</style>

      <svg
        className={`kf-svg ${animationClass || ""}`}
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="screenLightGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#00B0FF" stopOpacity="0.05" />
            <stop offset="55%" stopColor="#00B0FF" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#80D8FF" stopOpacity="0.70" />
            <stop offset="100%" stopColor="#80D8FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Bulb Prop (Aha! Moment) */}
        <g className="cat-prop-bulb" style={{ transformOrigin: "200px 40px" }}>
          <circle cx="200" cy="40" r="16" fill="#FFE082" opacity="0.5" />
          <path
            d="M 190,40 
               C 190,26 210,26 210,40 
               C 210,47 205,50 205,54 
               L 195,54 
               C 195,50 190,47 190,40 Z"
            fill="#FFE082"
            stroke={PALETTE.outline}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <rect x="195" y="54" width="10" height="4" rx="1" fill="#C3C3C3" stroke={PALETTE.outline} strokeWidth="4.5" />
          <path d="M 200,16 L 200,10" stroke={PALETTE.outline} strokeWidth="3" strokeLinecap="round" />
          <path d="M 183,28 L 178,24" stroke={PALETTE.outline} strokeWidth="3" strokeLinecap="round" />
          <path d="M 217,28 L 222,24" stroke={PALETTE.outline} strokeWidth="3" strokeLinecap="round" />
          <path d="M 178,40 L 172,40" stroke={PALETTE.outline} strokeWidth="3" strokeLinecap="round" />
          <path d="M 222,40 L 228,40" stroke={PALETTE.outline} strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="cat-face-root" style={{ transformOrigin: "200px 220px" }}>
          {/* ============================================================ */}
          {/* EARS                                                         */}
          {/* ============================================================ */}
          <g id="ears" className="cat-ears-group" style={{ transformOrigin: "200px 125px" }}>
            <g transform="translate(95,125) rotate(-30)">
              <g className="cat-ear-left" style={{ transformOrigin: "0px 0px" }}>
                <path
                  d="M-58,35 C-58,-35 -25,-86 0,-86 C25,-86 58,-35 58,35 Z"
                  fill={PALETTE.earOuter}
                  stroke={PALETTE.outline}
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <path
                  d="M-32,23 C-32,-23 -15,-63 0,-63 C15,-63 32,-23 32,23 Z"
                  fill={PALETTE.earInner}
                />
              </g>
            </g>
            <g transform="translate(305,125) rotate(30)">
              <g className="cat-ear-right" style={{ transformOrigin: "0px 0px" }}>
                <path
                  d="M-58,35 C-58,-35 -25,-86 0,-86 C25,-86 58,-35 58,35 Z"
                  fill={PALETTE.earOuter}
                  stroke={PALETTE.outline}
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <path
                  d="M-32,23 C-32,-23 -15,-63 0,-63 C15,-63 32,-23 32,23 Z"
                  fill={PALETTE.earInner}
                />
              </g>
            </g>
          </g>

          {/* ============================================================ */}
          {/* HEAD & FEATURES                                              */}
          {/* ============================================================ */}
          <g className="kf-head-group">
            {/* Head Base - Flatter top, widest part at eye level */}
            <path
              d="M 200,75
                 C 300,75 365,130 365,220
                 C 365,270 340,310 320,310
                 L 80,310
                 C 60,310 35,270 35,220
                 C 35,130 100,75 200,75 Z"
              fill={PALETTE.fur}
              stroke={PALETTE.outline}
              strokeWidth="6"
              strokeLinejoin="round"
            />

            {/* Blush */}
            <g className="cat-cheeks-group" style={{ transformOrigin: "200px 245px" }}>
              <ellipse cx="115" cy="245" rx="18" ry="10" fill={PALETTE.blush} />
              <ellipse cx="285" cy="245" rx="18" ry="10" fill={PALETTE.blush} />
            </g>

            {/* Eyes */}
            <g id="eyes" className="cat-eyes-group" style={{ transformOrigin: "200px 215px" }}>
              <g className="cat-pupils-group">
                <g className="cat-eye-left" style={{ transformOrigin: "145px 215px" }}>
                  <ellipse cx="145" cy="215" rx="19" ry="23" fill={PALETTE.eye} />
                  <circle className="cat-eye-highlight" cx="139" cy="207" r="6.5" fill={PALETTE.eyeHighlight} />
                  <circle className="cat-eye-highlight" cx="153" cy="226" r="2.5" fill={PALETTE.eyeHighlight} />
                </g>
                <g className="cat-eye-right" style={{ transformOrigin: "255px 215px" }}>
                  <ellipse cx="255" cy="215" rx="19" ry="23" fill={PALETTE.eye} />
                  <circle className="cat-eye-highlight" cx="249" cy="207" r="6.5" fill={PALETTE.eyeHighlight} />
                  <circle className="cat-eye-highlight" cx="263" cy="226" r="2.5" fill={PALETTE.eyeHighlight} />
                </g>
              </g>
            </g>

            {/* Nose */}
            <path 
              d="M 189,232 C 189,228 211,228 211,232 C 211,239 203,243 200,243 C 197,243 189,239 189,232 Z" 
              fill={PALETTE.nose} 
            />

            {/* Mouth */}
            <path
              d="M 182,246 C 182,254 195,256 200,243 C 205,256 218,254 218,246"
              fill="none"
              stroke={PALETTE.mouth}
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Whiskers */}
            <g id="whiskers" className="cat-whiskers-group" stroke={PALETTE.whisker} strokeWidth="5" strokeLinecap="round" style={{ transformOrigin: "200px 244px" }}>
              <path d="M 88,228 Q 60,220 35,220" fill="none" />
              <path d="M 84,244 Q 57,240 30,244" fill="none" />
              <path d="M 88,260 Q 60,265 40,278" fill="none" />

              <path d="M 312,228 Q 340,220 365,220" fill="none" />
              <path d="M 316,244 Q 343,240 370,244" fill="none" />
              <path d="M 312,260 Q 340,265 360,278" fill="none" />
            </g>

            {/* Sleeping Eye Curves (hidden by default) */}
            <g className="cat-sleep-lines">
              {/* Left sleep curve */}
              <path d="M 128,214 Q 145,226 162,214" fill="none" stroke={PALETTE.eye} strokeWidth="5" strokeLinecap="round" />
              {/* Right sleep curve */}
              <path d="M 238,214 Q 255,226 272,214" fill="none" stroke={PALETTE.eye} strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Happy Eye Curves (hidden by default) */}
            <g className="cat-happy-lines">
              <path d="M 128,214 Q 145,198 162,214" fill="none" stroke={PALETTE.eye} strokeWidth="5" strokeLinecap="round" />
              <path d="M 238,214 Q 255,198 272,214" fill="none" stroke={PALETTE.eye} strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Sleeping Z Group (hidden by default, now larger & styled with var(--cat-iris)) */}
            <g className="cat-z-group" style={{ transformOrigin: "320px 100px" }}>
              <text x="302" y="100" fontFamily="Inter, system-ui, sans-serif" fontSize="38" fontWeight="bold" fill="var(--cat-iris)" opacity="0.95" style={{ userSelect: 'none' }}>Z</text>
              <text x="326" y="74" fontFamily="Inter, system-ui, sans-serif" fontSize="26" fontWeight="bold" fill="var(--cat-iris)" opacity="0.8" style={{ userSelect: 'none' }}>z</text>
              <text x="342" y="54" fontFamily="Inter, system-ui, sans-serif" fontSize="18" fontWeight="bold" fill="var(--cat-iris)" opacity="0.6" style={{ userSelect: 'none' }}>z</text>
            </g>

            {/* Sleeping Bubble (expanding bubble at the nose, larger radius, thinner stroke) */}
            <circle className="cat-sleep-bubble" cx="193" cy="242" r="14" fill="#E0F7FA" stroke={PALETTE.outline} strokeWidth="2.5" opacity="0.65" style={{ transformOrigin: "193px 242px" }} />
            
            {/* Sleeping Bubble Pop Lines (8 lines + 4 droplets for a very prominent burst) */}
            <g className="cat-bubble-pop-lines" style={{ transformOrigin: "193px 242px" }}>
              {/* Orthogonals */}
              <line x1="193" y1="242" x2="193" y2="214" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="193" y2="270" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="165" y2="242" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="221" y2="242" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Diagonals */}
              <line x1="193" y1="242" x2="173" y2="222" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="213" y2="222" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="173" y2="262" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="193" y1="242" x2="213" y2="262" stroke={PALETTE.outline} strokeWidth="2.5" strokeLinecap="round" />

              {/* Tiny flying droplets near diagonal tips */}
              <circle cx="170" cy="219" r="3" fill="#E0F7FA" stroke={PALETTE.outline} strokeWidth="1.5" />
              <circle cx="216" cy="219" r="3" fill="#E0F7FA" stroke={PALETTE.outline} strokeWidth="1.5" />
              <circle cx="170" cy="265" r="3" fill="#E0F7FA" stroke={PALETTE.outline} strokeWidth="1.5" />
              <circle cx="216" cy="265" r="3" fill="#E0F7FA" stroke={PALETTE.outline} strokeWidth="1.5" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Coffee Cup (for Break state)                        */}
        {/* ============================================================ */}
        <g className="cat-prop-coffee cat-props" style={{ transformOrigin: "200px 355px" }}>
          {/* Saucer stays on table */}
          <ellipse cx="200" cy="390" rx="38" ry="7" fill={PALETTE.fur} stroke={PALETTE.outline} strokeWidth="4.5" />
          
          <g className="cat-coffee-lift">
            {/* Cup body - chubby mug */}
            <path
              d="M 165,345 L 165,375 C 165,385 175,390 200,390 C 225,390 235,385 235,375 L 235,345 Z"
              fill={PALETTE.earInner}
              stroke={PALETTE.outline}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            
            {/* Cute paw print on the mug */}
            <g transform="translate(192, 357) scale(0.65)" fill={PALETTE.blush}>
              <circle cx="13" cy="20" r="8" />
              <circle cx="3" cy="9" r="4.5" />
              <circle cx="13" cy="3" r="4.5" />
              <circle cx="23" cy="9" r="4.5" />
            </g>

            {/* Cup rim */}
            <ellipse cx="200" cy="345" rx="35" ry="8" fill={PALETTE.fur} stroke={PALETTE.outline} strokeWidth="5" />
            
            {/* Handle - slightly thicker and rounder */}
            <path
              d="M 235,355 C 260,350 260,380 232,380"
              fill="none"
              stroke={PALETTE.outline}
              strokeWidth="6"
              strokeLinecap="round"
            />
            
            {/* Liquid surface (coffee/tea) */}
            <ellipse cx="200" cy="346" rx="30" ry="5" fill="#8B6242" opacity="0.8" />
            
            {/* Steam lines */}
            <g className="cat-coffee-steam">
              <path d="M 188,335 C 188,325 196,325 196,315 C 196,305 188,305 188,295" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
              <path d="M 200,330 C 200,320 208,320 208,310 C 208,300 200,300 200,290" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
              <path d="M 212,335 C 212,325 220,325 220,315 C 220,305 212,305 212,295" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Thought Bubble (Thinking State)                      */}
        {/* ============================================================ */}
        <g className="cat-prop-thought-bubble cat-props" style={{ transformOrigin: "280px 45px" }}>
          <g transform="translate(25, -5)"> {/* Shifted further right and slightly up */}
            {/* Trail bubbles */}
            <circle className="cat-thought-trail-1" cx="225" cy="110" r="5" fill="#FFFFFF" stroke={PALETTE.outline} strokeWidth="3" style={{ transformOrigin: "225px 110px" }} />
            <circle className="cat-thought-trail-2" cx="242" cy="84" r="9" fill="#FFFFFF" stroke={PALETTE.outline} strokeWidth="3.5" style={{ transformOrigin: "242px 84px" }} />
            
            {/* Main Cloud Group */}
            <g transform="translate(0, -12)">
              <g className="cat-thought-cloud-group" style={{ transformOrigin: "255px 45px" }}>
                <path d="M 300 45 C 300 25, 281 19, 274 25 C 268 6, 235 6, 229 25 C 216 19, 203 32, 209 45 C 196 58, 216 71, 229 64 C 235 84, 268 84, 274 64 C 287 71, 300 58, 300 45 Z" 
                      fill="#FFFFFF" stroke={PALETTE.outline} strokeWidth="4.5" strokeLinejoin="round" />
                
                {/* Thinking dots */}
                <circle className="cat-thought-dot-1" cx="235" cy="45" r="6" fill={PALETTE.outline} />
                <circle className="cat-thought-dot-2" cx="255" cy="45" r="6" fill={PALETTE.outline} />
                <circle className="cat-thought-dot-3" cx="275" cy="45" r="6" fill={PALETTE.outline} />
              </g>
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Notebook (portrait notebook with rings on the right)  */}
        {/* ============================================================ */}
        <g className="cat-prop-notebook cat-props" style={{ transformOrigin: "200px 330px" }}>
          {/* Cover layer (Pink) */}
          <path
            d="M 140,310 
               L 260,310 
               C 265,310 270,315 270,320 
               L 270,405 
               C 270,410 265,415 255,415 
               L 145,415 
               C 135,415 130,410 130,400 
               L 130,320 
               C 130,315 135,310 140,310 Z"
            fill={PALETTE.earInner}
            stroke={PALETTE.outline}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Page layer (White) */}
          <path
            d="M 140,300 
               L 260,300 
               C 265,300 270,305 270,310 
               L 270,395 
               C 270,400 265,405 255,405 
               L 145,405 
               C 135,405 130,400 130,390 
               L 130,310 
               C 130,305 135,300 140,300 Z"
            fill={PALETTE.fur}
            stroke={PALETTE.outline}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Rings on the right side */}
          <path d="M 268,315 C 280,315 280,325 268,325" fill="none" stroke={PALETTE.outline} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 268,335 C 280,335 280,345 268,345" fill="none" stroke={PALETTE.outline} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 268,355 C 280,355 280,365 268,365" fill="none" stroke={PALETTE.outline} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 268,375 C 280,375 280,385 268,385" fill="none" stroke={PALETTE.outline} strokeWidth="4.5" strokeLinecap="round" />
          {/* Writing lines */}
          <path d="M 145,330 L 255,330" fill="none" stroke={PALETTE.blush} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 145,350 L 255,350" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.35" />
          <path d="M 145,370 L 255,370" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.35" />
        </g>

        {/* ============================================================ */}
        {/* PROPS - Keyboard (for Focused/Working Together state)       */}
        {/* ============================================================ */}
        <g className="cat-prop-keyboard cat-props" style={{ transformOrigin: "200px 360px" }}>
          {/* Base - Enlarge size slightly and raise Y position by 10px */}
          <rect x="120" y="334" width="160" height="52" rx="8" fill="var(--cat-ear-outer)" stroke={PALETTE.outline} strokeWidth="5.5" />
          {/* Spacebar at the top (closest to cat's paws - "กลับหัว" perspective) */}
          <rect x="175" y="342" width="50" height="5" rx="2.5" fill={PALETTE.outline} />
          {/* Keycaps rows below */}
          <line x1="131" y1="355" x2="269" y2="355" stroke={PALETTE.outline} strokeWidth="4.5" strokeDasharray="8 6" strokeLinecap="round" />
          <line x1="131" y1="366" x2="269" y2="366" stroke={PALETTE.outline} strokeWidth="4.5" strokeDasharray="6 8" strokeLinecap="round" />
          <line x1="131" y1="377" x2="269" y2="377" stroke={PALETTE.outline} strokeWidth="4.5" strokeDasharray="12 6" strokeLinecap="round" />
          {/* Cute Accent Key (Esc) at the bottom-right from viewer's perspective */}
          <rect x="257" y="373" width="7" height="6" rx="1.5" fill={PALETTE.nose} />
        </g>

        {/* ============================================================ */}
        {/* PROPS - Confetti (Celebration State)                         */}
        {/* ============================================================ */}
        <g className="cat-prop-confetti cat-props" style={{ transformOrigin: "200px 150px" }}>
          {/* Stars */}
          <path className="cat-star cat-star-1" d="M 100 80 L 105 95 L 120 95 L 108 105 L 112 120 L 100 110 L 88 120 L 92 105 L 80 95 L 95 95 Z" fill="#FFD700" />
          <path className="cat-star cat-star-2" d="M 300 60 L 305 75 L 320 75 L 308 85 L 312 100 L 300 90 L 288 100 L 292 85 L 280 75 L 295 75 Z" fill="#FFD700" />
          <path className="cat-star cat-star-3" d="M 200 30 L 203 40 L 213 40 L 205 47 L 208 57 L 200 50 L 192 57 L 195 47 L 187 40 L 197 40 Z" fill="#FFD700" />
          <path className="cat-star cat-star-4" d="M 50 140 L 53 150 L 63 150 L 55 157 L 58 167 L 50 160 L 42 167 L 45 157 L 37 150 L 47 150 Z" fill="#FFD700" />
          <path className="cat-star cat-star-5" d="M 350 160 L 354 175 L 369 175 L 357 185 L 361 200 L 349 190 L 337 200 L 341 185 L 329 175 L 344 175 Z" fill="#FFD700" />
          
          {/* Confetti Ribbons */}
          <rect className="cat-confetti cat-confetti-1" x="140" y="70" width="8" height="15" fill="#FF5733" rx="2" />
          <rect className="cat-confetti cat-confetti-2" x="250" y="90" width="8" height="15" fill="#33FF57" rx="2" />
          <rect className="cat-confetti cat-confetti-3" x="80" y="150" width="8" height="15" fill="#3357FF" rx="2" />
          <rect className="cat-confetti cat-confetti-4" x="320" y="140" width="8" height="15" fill="#FF33A1" rx="2" />
          <rect className="cat-confetti cat-confetti-5" x="210" y="100" width="8" height="15" fill="#FFD700" rx="2" />
        </g>

        {/* ============================================================ */}
        {/* PROPS - Stopwatch (Urgent State)                             */}
        {/* ============================================================ */}
        <g className="cat-prop-stopwatch cat-props" style={{ transformOrigin: "330px 250px" }}>
          {/* Main Body */}
          <circle cx="330" cy="250" r="28" fill="#FF6B6B" stroke={PALETTE.outline} strokeWidth="4.5" />
          <circle cx="330" cy="250" r="20" fill="#FFFFFF" stroke={PALETTE.outline} strokeWidth="3" />
          {/* Top Button */}
          <rect x="321" y="213" width="18" height="8" rx="2" fill="#FF6B6B" stroke={PALETTE.outline} strokeWidth="3.5" />
          <rect x="326" y="206" width="8" height="7" rx="1" fill={PALETTE.outline} />
          {/* Side Button */}
          <path d="M 352 220 L 362 212 L 366 217 L 356 225 Z" fill="#A0A0A0" stroke={PALETTE.outline} strokeWidth="2.5" />
          {/* Ticking Hand */}
          <g className="cat-stopwatch-hand" style={{ transformOrigin: "330px 250px" }}>
            <line x1="330" y1="250" x2="330" y2="233" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="330" cy="250" r="3.5" fill={PALETTE.outline} />
          </g>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Sweat Drop (Urgent State)                            */}
        {/* ============================================================ */}
        <g className="cat-prop-sweat cat-props" style={{ transformOrigin: "155px 160px" }}>
          <path d="M 155 145 Q 168 165 155 170 Q 142 165 155 145 Z" fill="#82C4FA" stroke={PALETTE.outline} strokeWidth="2.5" />
        </g>

        {/* ============================================================ */}
        {/* PROPS - BRB Sign (BRB State)                                 */}
        {/* ============================================================ */}
        <g className="cat-prop-brb cat-props" style={{ transformOrigin: "200px 235px" }}>
          {/* Sign Stick */}
          <rect x="192" y="270" width="16" height="60" fill="#A87A5B" stroke={PALETTE.outline} strokeWidth="4" />
          {/* Wooden Board */}
          <rect x="80" y="180" width="240" height="90" rx="6" fill="#F4D09A" stroke={PALETTE.outline} strokeWidth="4.5" />
          {/* Board details */}
          <line x1="80" y1="210" x2="320" y2="210" stroke="#C5965A" strokeWidth="2.5" opacity="0.6" />
          <line x1="80" y1="240" x2="320" y2="240" stroke="#C5965A" strokeWidth="2.5" opacity="0.6" />
          <circle cx="95" cy="195" r="3" fill="#A87A5B" />
          <circle cx="305" cy="195" r="3" fill="#A87A5B" />
          <circle cx="95" cy="255" r="3" fill="#A87A5B" />
          <circle cx="305" cy="255" r="3" fill="#A87A5B" />
          {/* BRB Text */}
          <text x="200" y="247" fontFamily="monospace, system-ui, sans-serif" fontSize="56" fontWeight="bold" fill="#5D4037" textAnchor="middle" style={{ letterSpacing: "2px" }}>
            BRB
          </text>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Zzz Particles (Sleeping / BRB)                       */}
        {/* ============================================================ */}
        <g className="cat-prop-zzz cat-props">
          <text className="cat-zzz-1" x="260" y="110" fontFamily="monospace, system-ui, sans-serif" fontSize="24" fontWeight="bold" fill={PALETTE.outline}>Z</text>
          <text className="cat-zzz-2" x="280" y="80" fontFamily="monospace, system-ui, sans-serif" fontSize="32" fontWeight="bold" fill={PALETTE.outline}>Z</text>
          <text className="cat-zzz-3" x="310" y="40" fontFamily="monospace, system-ui, sans-serif" fontSize="48" fontWeight="bold" fill={PALETTE.outline}>Z</text>
        </g>

        {/* ============================================================ */}
        {/* PROPS - Coffee Cup (for Break state)                        */}
        {/* ============================================================ */}
        <g className="cat-prop-coffee cat-props" style={{ transformOrigin: "200px 355px" }}>
          {/* Saucer stays on table */}
          <ellipse cx="200" cy="390" rx="38" ry="7" fill={PALETTE.fur} stroke={PALETTE.outline} strokeWidth="4.5" />
          
          <g className="cat-coffee-lift">
            {/* Cup body - chubby mug */}
            <path
              d="M 165,345 L 165,375 C 165,385 175,390 200,390 C 225,390 235,385 235,375 L 235,345 Z"
              fill={PALETTE.earInner}
              stroke={PALETTE.outline}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            
            {/* Cute paw print on the mug */}
            <g transform="translate(192, 357) scale(0.65)" fill={PALETTE.blush}>
              <circle cx="13" cy="20" r="8" />
              <circle cx="3" cy="9" r="4.5" />
              <circle cx="13" cy="3" r="4.5" />
              <circle cx="23" cy="9" r="4.5" />
            </g>

            {/* Cup rim */}
            <ellipse cx="200" cy="345" rx="35" ry="8" fill={PALETTE.fur} stroke={PALETTE.outline} strokeWidth="5" />
            
            {/* Handle - slightly thicker and rounder */}
            <path
              d="M 235,355 C 260,350 260,380 232,380"
              fill="none"
              stroke={PALETTE.outline}
              strokeWidth="6"
              strokeLinecap="round"
            />
            
            {/* Liquid surface (coffee/tea) */}
            <ellipse cx="200" cy="346" rx="30" ry="5" fill="#8B6242" opacity="0.8" />
            
            {/* Steam lines */}
            <g className="cat-coffee-steam">
              <path d="M 188,335 C 188,325 196,325 196,315 C 196,305 188,305 188,295" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
              <path d="M 200,330 C 200,320 208,320 208,310 C 208,300 200,300 200,290" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
              <path d="M 212,335 C 212,325 220,325 220,315 C 220,305 212,305 212,295" fill="none" stroke={PALETTE.outline} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* PAWS - Short, round, chubby buns with 3 distinct bumps       */}
        {/* ============================================================ */}
        <g id="paws">
          <g className="cat-paw-left" style={{ transformOrigin: "92.5px 314px" }}>
            {/* Pencil Prop (inside the paw group so it follows paw scribbling) */}
            <g className="cat-prop-pencil cat-props" style={{ transformOrigin: "92.5px 314px" }}>
              {/* Eraser */}
              <path d="M 52,242 L 62,232 C 65,229 69,229 72,232 L 78,238 C 81,241 81,245 78,248 L 68,258 Z" fill={PALETTE.earInner} stroke={PALETTE.outline} strokeWidth="5.5" strokeLinejoin="round" />
              {/* Metal band */}
              <path d="M 68,258 L 78,248 L 83,253 L 73,263 Z" fill="#C3C3C3" stroke={PALETTE.outline} strokeWidth="5.5" strokeLinejoin="round" />
              {/* Body */}
              <path d="M 73,263 L 83,253 L 132,308 L 122,318 Z" fill="#FFE082" stroke={PALETTE.outline} strokeWidth="5.5" strokeLinejoin="round" />
              {/* Wood cone */}
              <path d="M 122,318 L 132,308 L 145,330 Z" fill="#FBE3E7" stroke={PALETTE.outline} strokeWidth="5.5" strokeLinejoin="round" />
              {/* Lead tip */}
              <path d="M 137,317 L 134,321 L 145,330 Z" fill={PALETTE.eye} />
            </g>
            {/* Paw Path */}
            <path
              d="M 55,314
                 C 55,275 130,275 130,314
                 C 130,336 108,336 108,330
                 C 108,342 77,342 77,330
                 C 77,336 55,336 55,314 Z"
              fill={PALETTE.paw}
              stroke={PALETTE.outline}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path d="M 77,330 Q 77,318 83,316" fill="none" stroke={PALETTE.outline} strokeWidth="5" strokeLinecap="round" />
            <path d="M 108,330 Q 108,318 102,316" fill="none" stroke={PALETTE.outline} strokeWidth="5" strokeLinecap="round" />
          </g>
          <g className="cat-paw-right" style={{ transformOrigin: "307px 314px" }}>
            <path
              d="M 270,314
                 C 270,275 345,275 345,314
                 C 345,336 323,336 323,330
                 C 323,342 292,342 292,330
                 C 292,336 270,336 270,314 Z"
              fill={PALETTE.paw}
              stroke={PALETTE.outline}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path d="M 292,330 Q 292,318 298,316" fill="none" stroke={PALETTE.outline} strokeWidth="5" strokeLinecap="round" />
            <path d="M 323,330 Q 323,318 317,316" fill="none" stroke={PALETTE.outline} strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
        
        {/* Screen glow highlight overlay (narrow at bottom Y=450 below keyboard, casting onto lower face Y=185) */}
        <polygon className="cat-screen-glow" points="90,185 310,185 240,450 160,450" fill="url(#screenLightGrad)" opacity="0" pointerEvents="none" style={{ mixBlendMode: 'screen' }} />
      </svg>
    </div>
  );
}
