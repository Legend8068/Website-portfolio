import React from 'react';

export default function MusicPictogram({ className, style }) {
  return (
    <svg 
      className={className} 
      style={{ ...style, overflow: 'visible' }} 
      viewBox="75 0 285 480" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Animated figure vibing with headphones"
    >
      <defs>
        <style>{`
          /* === KINETIC TIMING — single 0.6s beat === */
          @keyframes headBob {
            0%   { transform: translateY(0); }
            22%  { transform: translateY(11px); }
            60%  { transform: translateY(-4px); }
            100% { transform: translateY(0); }
          }
          .head-group {
            transform-box: fill-box;
            transform-origin: center;
            animation: headBob 0.6s cubic-bezier(.22, 1.2, .36, 1) infinite;
            will-change: transform;
          }

          @keyframes bodyCompress {
            0%   { transform: translateY(0) scaleY(1); }
            22%  { transform: translateY(4px) scaleY(.97); }
            60%  { transform: translateY(-1px) scaleY(1.015); }
            100% { transform: translateY(0) scaleY(1); }
          }
          .body-group {
            transform-box: fill-box;
            transform-origin: center top;
            animation: bodyCompress 0.6s cubic-bezier(.22, 1.2, .36, 1) infinite;
            will-change: transform;
          }

          @keyframes armTap {
            0%   { transform: rotate(0deg); }
            22%  { transform: rotate(-13deg); }
            60%  { transform: rotate(4deg); }
            100% { transform: rotate(0deg); }
          }
          .forearm-group {
            transform-box: fill-box;
            transform-origin: 0% 100%;
            animation: armTap 0.6s cubic-bezier(.22, 1.2, .36, 1) infinite;
            will-change: transform;
          }

          @keyframes legBob {
            0%   { transform: translateY(0) scaleY(1); }
            22%  { transform: translateY(0) scaleY(.96); }
            60%  { transform: translateY(0) scaleY(1.02); }
            100% { transform: translateY(0) scaleY(1); }
          }
          .leg-group {
            transform-box: fill-box;
            transform-origin: center top;
            animation: legBob 0.6s cubic-bezier(.22, 1.2, .36, 1) infinite;
            will-change: transform;
          }

          @keyframes leftArmBob {
            0%   { transform: translateY(0) rotate(0deg); }
            22%  { transform: translateY(2px) rotate(-2deg); }
            60%  { transform: translateY(-1px) rotate(1deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          .left-arm-group {
            transform-box: fill-box;
            transform-origin: left center;
            animation: leftArmBob 0.6s cubic-bezier(.22, 1.2, .36, 1) infinite;
            will-change: transform;
          }

          /* MUSIC ACCENTS */
          @keyframes pulse {
            0%   { transform: translate(0,0) scale(.4); opacity: 0; }
            18%  { opacity: 1; }
            75%  { transform: var(--push) scale(1.4); opacity: 0; }
            100% { transform: var(--push) scale(1.4); opacity: 0; }
          }
          .accent {
            transform-box: fill-box;
            transform-origin: left center;
            animation: pulse 0.6s cubic-bezier(.4, 0, .2, 1) infinite;
            will-change: transform, opacity;
          }
          .accent-1 { --push: translate(40px, -18px); }
          .accent-2 { --push: translate(48px, 8px); animation-delay: 0.06s; }
          .accent-3 { --push: translate(44px, -40px); animation-delay: 0.12s; }

          /* ENTRY */
          @keyframes peekIn {
            0%   { transform: translateX(-280px); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
          }
          .figure-root {
            animation: peekIn 1.0s cubic-bezier(.22, 1, .36, 1) both;
          }
        `}</style>
      </defs>

      <g className="figure-root">

        {/* LEG */}
        <g className="leg-group">
          <path
            fill="#3DA5D9"
            d="
              M 172 238
              C 198 242, 210 272, 206 330
              C 202 376, 188 428, 174 460
              C 166 476, 156 476, 152 468
              C 150 456, 158 420, 166 376
              C 174 324, 172 272, 162 248
              C 160 242, 162 238, 172 238 Z
            "
          />
        </g>

        {/* LEFT ARM (Gripping the wall edge at X=75) */}
        <g className="left-arm-group">
          <path
            fill="#3DA5D9"
            d="
              M 165 150
              C 140 160, 90 170, 75 200
              C 65 220, 95 230, 105 210
              C 120 180, 150 160, 170 155 Z
            "
          />
        </g>

        {/* HEAD + HEADPHONES */}
        <g className="head-group">
          <circle cx="175" cy="80" r="40" fill="#3DA5D9" />

          {/* Headphone band */}
          <path
            d="M 137 60 Q 175 18 215 62"
            fill="none"
            stroke="#A41623"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Front earcup */}
          <circle
            cx="217" cy="84" r="17"
            fill="none"
            stroke="#A41623"
            strokeWidth="14"
          />
          {/* Back earcup */}
          <path
            d="M 135 73 Q 126 90 135 107"
            fill="none"
            stroke="#A41623"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>

        {/* FOREARM */}
        <g className="forearm-group">
          <path
            fill="#3DA5D9"
            d="
              M 205 174
              C 218 148, 250 136, 292 110
              C 316 94, 320 72, 306 62
              C 290 78, 270 104, 244 128
              C 222 148, 208 168, 205 174 Z
            "
          />
        </g>

        {/* MUSIC ACCENTS */}
        <g className="accent accent-1">
          <path
            fill="#A41623"
            d="M 246 68 Q 266 64 284 70 Q 266 74 246 68 Z"
          />
        </g>
        <g className="accent accent-2">
          <path
            fill="#A41623"
            d="M 250 100 Q 272 104 290 100 Q 272 108 250 100 Z"
          />
        </g>
        <g className="accent accent-3">
          <path
            fill="#A41623"
            d="M 242 42 Q 262 36 278 40 Q 262 46 242 42 Z"
          />
        </g>

      </g>
    </svg>
  );
}
