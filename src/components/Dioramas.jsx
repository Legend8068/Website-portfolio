import React from 'react';

export function ServerDiorama() {
  return (
    <svg className="diorama server-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel server rack and network cables">
      <defs>
        <filter id="serverDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="serverDropLg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="6" dy="10" stdDeviation="0" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      
      <rect x="0" y="0" width="640" height="480"  fill="#141416" />
      
      {/* Background Grid */}
      <g stroke="#222225" strokeWidth="2">
        <line x1="100" y1="0" x2="100" y2="480" />
        <line x1="200" y1="0" x2="200" y2="480" />
        <line x1="440" y1="0" x2="440" y2="480" />
        <line x1="540" y1="0" x2="540" y2="480" />
      </g>
      
      {/* Network Cables (Background) */}
      <path d="M 50 100 Q 150 50, 200 150 T 320 200" fill="none" stroke="#FF4F3B" strokeWidth="6" filter="url(#serverDrop)" />
      <path d="M 500 400 Q 400 450, 350 350 T 320 280" fill="none" stroke="#A5A19A" strokeWidth="6" filter="url(#serverDrop)" />
      
      {/* Server Rack Box */}
      <rect x="180" y="80" width="280" height="320"  fill="#222225" filter="url(#serverDropLg)" className="float-l1" />
      <rect x="195" y="95" width="250" height="290"  fill="#1A1A1C" className="float-l1" />
      
      {/* Server Blade 1 */}
      <g filter="url(#serverDrop)" transform="translate(205, 110)" className="float-l2">
        <rect x="0" y="0" width="230" height="45"  fill="#2A2A2D" />
        <rect x="10" y="10" width="150" height="6"  fill="#141416" />
        <rect x="10" y="25" width="100" height="6"  fill="#141416" />
        <circle cx="180" cy="22" r="5" fill="#A5A19A" />
        <circle cx="200" cy="22" r="5" fill="#FF4F3B" />
      </g>
      
      {/* Server Blade 2 */}
      <g filter="url(#serverDrop)" transform="translate(205, 170)" className="float-l3">
        <rect x="0" y="0" width="230" height="45"  fill="#2A2A2D" />
        <rect x="10" y="10" width="120" height="6"  fill="#141416" />
        <rect x="10" y="25" width="140" height="6"  fill="#141416" />
        <circle cx="180" cy="22" r="5" fill="#A5A19A" />
        <circle cx="200" cy="22" r="5" fill="#A5A19A" />
      </g>
      
      {/* Server Blade 3 */}
      <g filter="url(#serverDrop)" transform="translate(205, 230)" className="float-l2">
        <rect x="0" y="0" width="230" height="45"  fill="#2A2A2D" />
        <rect x="10" y="10" width="160" height="6"  fill="#141416" />
        <rect x="10" y="25" width="90" height="6"  fill="#141416" />
        <circle cx="180" cy="22" r="5" fill="#FFB800" />
        <circle cx="200" cy="22" r="5" fill="#A5A19A" />
      </g>
      
      {/* Server Blade 4 (Storage) */}
      <g filter="url(#serverDrop)" transform="translate(205, 290)" className="float-l3">
        <rect x="0" y="0" width="230" height="75"  fill="#2A2A2D" />
        <g fill="#141416">
          <rect x="15" y="15" width="40" height="45"  />
          <rect x="65" y="15" width="40" height="45"  />
          <rect x="115" y="15" width="40" height="45"  />
          <rect x="165" y="15" width="40" height="45"  />
        </g>
        <circle cx="35" cy="25" r="3" fill="#A5A19A" />
        <circle cx="85" cy="25" r="3" fill="#A5A19A" />
        <circle cx="135" cy="25" r="3" fill="#FF4F3B" />
        <circle cx="185" cy="25" r="3" fill="#A5A19A" />
      </g>
      
      {/* Foreground Cables */}
      <path d="M 210 135 C 100 135, 100 250, 210 250" fill="none" stroke="#FFB800" strokeWidth="8" strokeLinecap="round" filter="url(#serverDrop)" className="float-l1" />
      <path d="M 400 195 C 500 195, 500 310, 400 310" fill="none" stroke="#7C7F8A" strokeWidth="8" strokeLinecap="round" filter="url(#serverDrop)" className="float-l2" />
    </svg>
  );
}

export function AudioSynthDiorama() {
  return (
    <svg className="diorama synth-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel audio synthesizer">
      <defs>
        <filter id="synthDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="synthDropLg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="6" dy="10" stdDeviation="0" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      
      <rect x="0" y="0" width="640" height="480"  fill="#8A867F" />
      
      {/* Sound Waves Background */}
      <path d="M 0 240 Q 160 140, 320 240 T 640 240" fill="none" stroke="#A5A19A" strokeWidth="25" filter="url(#synthDrop)" opacity="0.6" />
      <path d="M 0 280 Q 160 380, 320 280 T 640 280" fill="none" stroke="#6E6B66" strokeWidth="15" filter="url(#synthDrop)" opacity="0.8" />
      
      {/* Synthesizer Body */}
      <g transform="translate(100, 140)" filter="url(#synthDropLg)" className="float-l1">
        <rect x="0" y="0" width="440" height="240"  fill="#222225" />
        <rect x="15" y="15" width="410" height="90"  fill="#141416" />
        
        {/* Synth Pads/Knobs */}
        <g fill="#2A2A2D" filter="url(#synthDrop)">
          {/* Knobs */}
          <circle cx="50" cy="60" r="20" />
          <circle cx="100" cy="60" r="20" />
          <circle cx="150" cy="60" r="20" />
          {/* Sliders */}
          <rect x="200" y="30" width="10" height="60"  />
          <rect x="230" y="30" width="10" height="60"  />
          <rect x="260" y="30" width="10" height="60"  />
          {/* Screen */}
          <rect x="300" y="30" width="110" height="60"  fill="#A5A19A" />
        </g>
        
        {/* Screen Waveform */}
        <path d="M 310 60 Q 325 40, 340 60 T 370 60 T 400 60" fill="none" stroke="#EAE6DF" strokeWidth="4" />
        
        {/* Knob Indicators */}
        <circle cx="45" cy="55" r="3" fill="#FF4F3B" />
        <circle cx="105" cy="50" r="3" fill="#FFB800" />
        <circle cx="145" cy="65" r="3" fill="#FF4F3B" />
        
        {/* Slider Thumbs */}
        <rect x="195" y="45" width="20" height="10"  fill="#FF4F3B" />
        <rect x="225" y="65" width="20" height="10"  fill="#EAE6DF" />
        <rect x="255" y="35" width="20" height="10"  fill="#FFB800" />
        
        {/* Piano Keys */}
        <g transform="translate(15, 120)">
          <rect x="0" y="0" width="410" height="105"  fill="#EAE6DF" filter="url(#synthDrop)" />
          {/* Black Keys */}
          <g fill="#141416">
            <rect x="35" y="0" width="25" height="65"  />
            <rect x="75" y="0" width="25" height="65"  />
            <rect x="155" y="0" width="25" height="65"  />
            <rect x="195" y="0" width="25" height="65"  />
            <rect x="235" y="0" width="25" height="65"  />
            <rect x="315" y="0" width="25" height="65"  />
            <rect x="355" y="0" width="25" height="65"  />
          </g>
        </g>
      </g>
      
      {/* Floating Notes */}
      <g fill="#EAE6DF" filter="url(#synthDrop)" className="float-l2">
        <path d="M 460 100 Q 470 70, 500 80 Q 510 100, 480 110 Z" opacity="0.9" />
        <circle cx="475" cy="115" r="12" />
        
        <path d="M 120 70 Q 130 40, 160 50 Q 170 70, 140 80 Z" opacity="0.7" />
        <circle cx="135" cy="85" r="10" />
      </g>
    </svg>
  );
}

export function CardsDiorama() {
  return (
    <svg className="diorama cards-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel deck of cards fanning out">
      <defs>
        <filter id="cardDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <filter id="cardDropMd" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="6" dy="10" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="cardDropLg" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="10" dy="16" stdDeviation="0" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      
      <rect x="0" y="0" width="640" height="480"  fill="#D93A28" />
      
      {/* Background Magic Swirls */}
      <path d="M 100 240 Q 200 100, 320 240 T 540 240" fill="none" stroke="#FF4F3B" strokeWidth="20" strokeLinecap="round" opacity="0.6" />
      <path d="M 150 240 Q 320 400, 490 240" fill="none" stroke="#EAE6DF" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
      
      {/* Card Fan */}
      <g transform="translate(320, 360)">
        {/* Card 1 */}
        <g transform="rotate(-45) translate(0, -180)" filter="url(#cardDrop)" className="float-l1">
          <rect x="-60" y="-85" width="120" height="170"  fill="#EAE6DF" />
          <rect x="-50" y="-75" width="100" height="150"  fill="none" stroke="#FF4F3B" strokeWidth="2" />
          <polygon points="0,-20 15,0 0,20 -15,0" fill="#FF4F3B" />
          <text x="-40" y="-55" fontFamily="Fragment Mono" fontSize="16" fill="#FF4F3B" fontWeight="bold">A</text>
        </g>
        
        {/* Card 2 */}
        <g transform="rotate(-15) translate(0, -190)" filter="url(#cardDropMd)" className="float-l2">
          <rect x="-60" y="-85" width="120" height="170"  fill="#EAE6DF" />
          <rect x="-50" y="-75" width="100" height="150"  fill="none" stroke="#6E6B66" strokeWidth="2" />
          <path d="M -10 -5 C -20 -15, 0 -25, 0 0 C 0 -25, 20 -15, 10 -5 C 15 15, -15 15, -10 -5 Z" fill="#6E6B66" />
          <text x="-40" y="-55" fontFamily="Fragment Mono" fontSize="16" fill="#6E6B66" fontWeight="bold">K</text>
        </g>
        
        {/* Card 3 */}
        <g transform="rotate(15) translate(0, -190)" filter="url(#cardDropMd)" className="float-l3">
          <rect x="-60" y="-85" width="120" height="170"  fill="#EAE6DF" />
          <rect x="-50" y="-75" width="100" height="150"  fill="none" stroke="#FFB800" strokeWidth="2" />
          <polygon points="0,-15 12,-5 12,10 0,20 -12,10 -12,-5" fill="#FFB800" />
          <text x="-40" y="-55" fontFamily="Fragment Mono" fontSize="16" fill="#FFB800" fontWeight="bold">Q</text>
        </g>
        
        {/* Card 4 (Top) */}
        <g transform="rotate(45) translate(0, -180)" filter="url(#cardDropLg)" className="float-l1">
          <rect x="-60" y="-85" width="120" height="170"  fill="#EAE6DF" />
          <rect x="-50" y="-75" width="100" height="150"  fill="none" stroke="#222225" strokeWidth="2" />
          <path d="M 0 -20 C -20 -20, -20 10, 0 25 C 20 10, 20 -20, 0 -20 Z" fill="#222225" />
          <text x="-40" y="-55" fontFamily="Fragment Mono" fontSize="16" fill="#222225" fontWeight="bold">J</text>
        </g>
      </g>
      
      {/* Floating Pips */}
      <g filter="url(#cardDrop)" className="float-l2">
        <polygon points="120,80 135,100 120,120 105,100" fill="#FF4F3B" transform="rotate(15 120 100)" />
        <path d="M 540 100 C 520 100, 520 130, 540 145 C 560 130, 560 100, 540 100 Z" fill="#222225" transform="rotate(-20 540 120)" />
        <polygon points="500,380 515,395 515,415 500,430 485,415 485,395" fill="#FFB800" transform="rotate(40 500 405)" />
      </g>
    </svg>
  );
}

export function DroneMailDiorama() {
  return (
    <svg className="diorama drone-mail-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel drone carrying a letter">
      <defs>
        <filter id="droneMailDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="6" dy="12" stdDeviation="0" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <filter id="envelopeDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      
      <rect x="0" y="0" width="640" height="480"  fill="#2A2A2D" />
      
      {/* Clouds Background */}
      <path d="M 0 150 Q 150 100, 300 180 T 640 150" fill="none" stroke="#3A3A3D" strokeWidth="60" strokeLinecap="round" />
      <path d="M 50 350 Q 200 400, 400 320 T 640 350" fill="none" stroke="#222225" strokeWidth="80" strokeLinecap="round" />
      
      {/* Connection Lines (Tether) */}
      <line x1="320" y1="200" x2="320" y2="300" stroke="#7C7F8A" strokeWidth="4" strokeDasharray="8 8" />
      <line x1="280" y1="200" x2="280" y2="300" stroke="#7C7F8A" strokeWidth="4" strokeDasharray="8 8" />
      <line x1="360" y1="200" x2="360" y2="300" stroke="#7C7F8A" strokeWidth="4" strokeDasharray="8 8" />
      
      {/* Mail Envelope */}
      <g filter="url(#envelopeDrop)" transform="translate(220, 280)" className="float-l2">
        <rect x="0" y="0" width="200" height="120"  fill="#44444A" />
        {/* Envelope Flaps */}
        <polygon points="0,0 100,70 200,0" fill="#EAE6DF" />
        <polygon points="0,120 100,70 200,120" fill="#3A3A40" />
        <polygon points="0,0 100,70 0,120" fill="#44444A" />
        <polygon points="200,0 100,70 200,120" fill="#44444A" />
        {/* Wax Seal */}
        <circle cx="100" cy="70" r="18" fill="#FF4F3B" />
        <circle cx="100" cy="70" r="14" fill="none" stroke="#D93A28" strokeWidth="2" />
        <path d="M 95 65 L 105 75 M 105 65 L 95 75" stroke="#D93A28" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Drone */}
      <g filter="url(#droneMailDrop)" transform="translate(320, 150)" className="float-l1">
        {/* Propeller Arms */}
        <line x1="-80" y1="-50" x2="80" y2="50" stroke="#1A1A1C" strokeWidth="8" />
        <line x1="-80" y1="50" x2="80" y2="-50" stroke="#1A1A1C" strokeWidth="8" />
        
        {/* Propellers */}
        <circle cx="-80" cy="-50" r="25" fill="none" stroke="#EAE6DF" strokeWidth="6" strokeDasharray="12 12" />
        <circle cx="80" cy="50" r="25" fill="none" stroke="#EAE6DF" strokeWidth="6" strokeDasharray="12 12" />
        <circle cx="-80" cy="50" r="25" fill="none" stroke="#EAE6DF" strokeWidth="6" strokeDasharray="12 12" />
        <circle cx="80" cy="-50" r="25" fill="none" stroke="#EAE6DF" strokeWidth="6" strokeDasharray="12 12" />
        
        {/* Drone Body */}
        <rect x="-30" y="-30" width="60" height="60"  fill="#A5A19A" />
        <rect x="-20" y="-20" width="40" height="40"  fill="#8A867F" />
        <circle cx="0" cy="0" r="10" fill="#FF4F3B" />
        <circle cx="0" cy="0" r="4" fill="#EAE6DF" />
      </g>
    </svg>
  );
}

export function TchoukballDiorama() {
  return (
    <svg className="diorama tchoukball-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel tchoukball frame and bouncing ball">
      <defs>
        <filter id="tchoukDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="tchoukDropLg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="0" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      
      {/* Layered Backgrounds */}
      <g filter="url(#tchoukDropLg)">
        <circle cx="320" cy="480" r="380" fill="#3A3A40" />
        <circle cx="320" cy="480" r="320" fill="#FF4F3B" />
        <circle cx="320" cy="480" r="260" fill="#D93A28" />
      </g>
      
      {/* Background Court Lines */}
      <g stroke="#EAE6DF" strokeWidth="8" opacity="0.3" className="float-l1">
        <path d="M 0 350 L 640 350" fill="none" />
        <path d="M 320 350 L 150 480" fill="none" />
      </g>
      
      {/* Motion Trails */}
      <path d="M 420 80 Q 250 50, 180 180" fill="none" stroke="#EAE6DF" strokeWidth="8" strokeDasharray="16 16" filter="url(#tchoukDrop)" opacity="0.8" className="float-l2" />
      <path d="M 180 180 Q 350 320, 520 220" fill="none" stroke="#EAE6DF" strokeWidth="8" strokeDasharray="16 16" filter="url(#tchoukDrop)" opacity="0.8" className="float-l2" />
      
      {/* Tchoukball Frame */}
      <g filter="url(#tchoukDropLg)" transform="translate(180, 180)" className="float-l3">
        {/* Shadow/Base */}
        <rect x="-80" y="-80" width="160" height="160" transform="rotate(45)" fill="#EAE6DF" />
        <rect x="-70" y="-70" width="140" height="140" transform="rotate(45)" fill="#1A1A1C" />
        
        {/* Net Grid */}
        <g stroke="#FFB800" strokeWidth="4">
          <line x1="-50" y1="-50" x2="50" y2="50" />
          <line x1="-30" y1="-70" x2="70" y2="30" />
          <line x1="-70" y1="-30" x2="30" y2="70" />
          
          <line x1="-50" y1="50" x2="50" y2="-50" />
          <line x1="-70" y1="30" x2="30" y2="-70" />
          <line x1="-30" y1="70" x2="70" y2="-30" />
        </g>
        
        {/* Inner Padding */}
        <rect x="-60" y="-60" width="120" height="120" transform="rotate(45)" fill="none" stroke="#EAE6DF" strokeWidth="6" />
      </g>
      
      {/* The Ball */}
      <g filter="url(#tchoukDropLg)" transform="translate(520, 220)" className="float-l1">
        <circle cx="0" cy="0" r="40" fill="#EAE6DF" />
        {/* Ball Panels */}
        <path d="M -25 -25 Q 0 -10, 25 -25 Q 10 0, 25 25 Q 0 10, -25 25 Q -10 0, -25 -25 Z" fill="#141416" />
        <circle cx="0" cy="0" r="12" fill="#FF4F3B" />
      </g>
    </svg>
  );
}

export function GraduationDiorama() {
  return (
    <svg className="diorama graduation-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel graduation books">
      <defs>
        <filter id="gradDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="gradDropLg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="0" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      
      {/* Concentric Layered Background */}
      <g filter="url(#gradDropLg)">
        <circle cx="320" cy="240" r="220" fill="#3A3A40" />
        <circle cx="320" cy="240" r="180" fill="#7C7F8A" />
        <circle cx="320" cy="240" r="140" fill="#A5A19A" />
      </g>
      
      {/* Background Decor (Stars/Shapes) */}
      <g filter="url(#gradDrop)" className="float-l3">
        <path d="M 160 140 L 170 120 L 180 140 L 200 150 L 180 160 L 170 180 L 160 160 L 140 150 Z" fill="#FFB800" />
        <circle cx="480" cy="120" r="10" fill="#FF4F3B" />
      </g>

      <g transform="translate(180, 160)" className="float-l1">
        {/* Book 3 (Bottom) */}
        <g filter="url(#gradDrop)">
          <path d="M20,200 L260,180 L300,220 L60,240 Z" fill="#FF4F3B" />
          <path d="M20,200 L60,240 L60,260 L20,220 Z" fill="#D93A28" />
          <path d="M60,240 L300,220 L300,240 L60,260 Z" fill="#EAE6DF" />
          {/* Panel pages */}
          <line x1="60" y1="245" x2="300" y2="225" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
          <line x1="60" y1="250" x2="300" y2="230" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
        </g>
        
        {/* Book 2 */}
        <g filter="url(#gradDrop)" transform="translate(0, -30) rotate(-5 160 200)">
          <path d="M40,190 L240,170 L280,210 L80,230 Z" fill="#8A867F" />
          <path d="M40,190 L80,230 L80,250 L40,210 Z" fill="#6E6B66" />
          <path d="M80,230 L280,210 L280,230 L80,250 Z" fill="#EAE6DF" />
          {/* Panel pages */}
          <line x1="80" y1="235" x2="280" y2="215" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
          <line x1="80" y1="240" x2="280" y2="220" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
        </g>
        
        {/* Book 1 (Top) */}
        <g filter="url(#gradDrop)" transform="translate(10, -60) rotate(3 160 200)">
          <path d="M50,180 L230,160 L260,190 L80,210 Z" fill="#FFB800" />
          <path d="M50,180 L80,210 L80,230 L50,200 Z" fill="#C79000" />
          <path d="M80,210 L260,190 L260,210 L80,230 Z" fill="#EAE6DF" />
          {/* Panel pages */}
          <line x1="80" y1="215" x2="260" y2="195" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
          <line x1="80" y1="220" x2="260" y2="200" stroke="#1A1A1C" strokeWidth="1" opacity="0.2" />
        </g>
      </g>
      
      {/* Graduation Cap floating */}
      <g filter="url(#gradDropLg)" transform="translate(120, 60) rotate(-10)" className="float-l2">
        {/* Cap Base */}
        <path d="M250,90 L280,120 L220,120 Z" fill="#222225" />
        {/* Cap Top */}
        <path d="M160,80 L250,50 L340,80 L250,110 Z" fill="#141416" stroke="#222225" strokeWidth="2" />
        {/* Button */}
        <circle cx="250" cy="80" r="6" fill="#EAE6DF" />
        {/* Tassel */}
        <path d="M250,80 Q 280,100 290,140" fill="none" stroke="#FFB800" strokeWidth="4" />
        <rect x="284" y="140" width="12" height="20" fill="#FF4F3B" />
        <line x1="286" y1="140" x2="286" y2="160" stroke="#D93A28" strokeWidth="1" />
        <line x1="290" y1="140" x2="290" y2="160" stroke="#D93A28" strokeWidth="1" />
        <line x1="294" y1="140" x2="294" y2="160" stroke="#D93A28" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function SingaporeMapDiorama() {
  return (
    <svg className="diorama map-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel map of Singapore">
      <defs>
        <filter id="mapDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="8" stdDeviation="0" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <filter id="pinDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="5" stdDeviation="0" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <pattern id="mapLines" width="100" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="19" x2="100" y2="19" stroke="#7C7F8A" strokeWidth="1" strokeOpacity="0.3" />
        </pattern>
      </defs>
      
      {/* Backplane panel */}
      <rect x="0" y="0" width="640" height="480"  fill="#33333A" />
      <rect x="20" y="20" width="600" height="440"  fill="#3A3A40" />
      
      {/* sonar echoes: concentric square sweeps */}
      <g fill="none" stroke="#FFB800" strokeWidth="3" opacity="0.22" className="float-l1"
        shapeRendering="crispEdges">
        <rect x="190" y="130" width="260" height="220" />
        <rect x="140" y="90" width="360" height="300" />
        <rect x="90" y="50" width="460" height="380" />
      </g>

      {/* Singapore, rasterised — the island as a coarse bitmap:
          bone coastline, red urban belt, grey core. */}
      <g filter="url(#mapDrop)" shapeRendering="crispEdges" className="float-l2">
        {(() => {
          const rows = [
            '...bbbbb.....',
            '..bbrrrbb..b.',
            '.bbrrgrrbbbb.',
            'bbrrggggrrbb.',
            'bbrrgggrrrbb.',
            '.bbrrrrrrbb..',
            '..bbbbbbbb...',
            '....bbbb.....',
          ]
          const C = { b: '#EAE6DF', r: '#FF4F3B', g: '#A5A19A' }
          const S = 26
          const ox = 320 - (13 * S) / 2
          const oy = 240 - (8 * S) / 2
          return rows.map((row, y) => [...row].map((ch, x) => (
            ch !== '.' ? (
              <rect key={x + '-' + y} x={ox + x * S} y={oy + y * S}
                width={S} height={S} fill={C[ch]} />
            ) : null
          )))
        })()}
        {/* street raster over the urban belt */}
        <g stroke="#141416" strokeWidth="2" opacity="0.3">
          <line x1="220" y1="188" x2="420" y2="188" />
          <line x1="220" y1="240" x2="420" y2="240" />
          <line x1="270" y1="140" x2="270" y2="290" />
          <line x1="330" y1="140" x2="330" y2="290" />
          <line x1="390" y1="140" x2="390" y2="290" />
        </g>
      </g>

      {/* SUTD pin: a square marker on a pole, east side */}
      <g filter="url(#pinDrop)" className="float-l3" shapeRendering="crispEdges">
        <rect x="424" y="142" width="4" height="50" fill="#EAE6DF" />
        <rect x="412" y="116" width="28" height="28" fill="#FF4F3B" />
        <rect x="421" y="125" width="10" height="10" fill="#EAE6DF" />
        <text x="450" y="136" fontFamily="Fragment Mono" fontWeight="700" fontSize="12"
          letterSpacing="1" fill="#EAE6DF" opacity="0.85">SUTD</text>
      </g>
    </svg>
  );
}

export function CodeWindowDiorama() {
  return (
    <svg className="diorama code-window-diorama" viewBox="0 0 640 480" role="img" aria-label="Pixel code window">
      <defs>
        <filter id="codeDrop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="codeDropLg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="0" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <pattern id="lines" width="100" height="24" patternUnits="userSpaceOnUse">
          <line x1="0" y1="23" x2="100" y2="23" stroke="#7C7F8A" strokeWidth="1.5" strokeOpacity="0.4" />
        </pattern>
      </defs>
      
      {/* Background folder */}
      <g filter="url(#codeDrop)">
        <path d="M366,44 L382,12 L500,12 L516,44 Z" fill="rgba(12,20,40,0.25)" transform="translate(4,5)" />
        <path d="M366,44 L382,12 L500,12 L516,44 Z" fill="#2E2E32" />
      </g>
      <g filter="url(#codeDropLg)">
        <path d="M0,40 L160,40 L180,0 L320,0 L340,40 L640,40 L640,480 L0,480 Z" fill="#33333A" />
        <rect x="0" y="40" width="640" height="440" fill="#3A3A40" />
        <path d="M0,40 L640,40" stroke="#FFB800" strokeWidth="2" strokeOpacity="0.3" />
      </g>
      
      {/* Floating Syntax Elements */}
      <g className="float-l3">
        <text x="50" y="100" fontFamily="monospace" fontSize="60" fill="#D93A28" fontWeight="bold" opacity="0.9" filter="url(#codeDrop)" transform="rotate(-15 50 100)">{"{"}</text>
      </g>
      <g className="float-l2">
        <text x="550" y="400" fontFamily="monospace" fontSize="60" fill="#8A867F" fontWeight="bold" opacity="0.9" filter="url(#codeDrop)" transform="rotate(25 550 400)">{"}"}</text>
      </g>
      
      {/* Main code window panel */}
      <g filter="url(#codeDropLg)" transform="translate(120, 100)" className="float-l1">
        {/* Panel shadow and base */}
        <rect x="0" y="0" width="400" height="280"  fill="#EAE6DF" />
        <rect x="0" y="0" width="400" height="280"  fill="url(#lines)" />
        
        {/* Red Margin Line */}
        <line x1="40" y1="0" x2="40" y2="280" stroke="#FF4F3B" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="44" y1="0" x2="44" y2="280" stroke="#FF4F3B" strokeWidth="0.5" strokeOpacity="0.6" />
        
        {/* Binder Holes */}
        <circle cx="20" cy="40" r="8" fill="#141416" filter="url(#codeDrop)" />
        <circle cx="20" cy="140" r="8" fill="#141416" filter="url(#codeDrop)" />
        <circle cx="20" cy="240" r="8" fill="#141416" filter="url(#codeDrop)" />
        
        {/* Code blocks (pixel strips) */}
        <g filter="url(#codeDrop)">
          {/* function init() { */}
          <rect x="60" y="32" width="60" height="14"  fill="#FF4F3B" />
          <rect x="130" y="32" width="80" height="14"  fill="#A5A19A" />
          <rect x="220" y="32" width="20" height="14"  fill="#FFB800" />
          
          {/*   const app = new App(); */}
          <rect x="80" y="80" width="40" height="14"  fill="#FF4F3B" />
          <rect x="130" y="80" width="30" height="14"  fill="#8A867F" />
          <rect x="170" y="80" width="20" height="14"  fill="#FF4F3B" />
          <rect x="200" y="80" width="90" height="14"  fill="#FFB800" />
          
          {/*   app.render(); */}
          <rect x="80" y="128" width="30" height="14"  fill="#8A867F" />
          <rect x="120" y="128" width="70" height="14"  fill="#A5A19A" />
          
          {/*   return true; */}
          <rect x="80" y="176" width="50" height="14"  fill="#FF4F3B" />
          <rect x="140" y="176" width="40" height="14"  fill="#FFB800" />
          
          {/* } */}
          <rect x="60" y="224" width="20" height="14"  fill="#FFB800" />
        </g>
      </g>
      
      {/* Floating Widget (Post-it note) */}
      <g filter="url(#codeDropLg)" transform="translate(420, 260) rotate(5)" className="float-l2">
        <rect x="0" y="0" width="140" height="140" fill="#FF4F3B" />
        <path d="M 0 140 Q 70 130 140 140 L 140 0 L 0 0 Z" fill="#D93A28" opacity="0.3" />
        
        {/* Graph */}
        <path d="M 30 100 L 50 60 L 70 80 L 100 30" fill="none" stroke="#EAE6DF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="30" r="6" fill="#EAE6DF" filter="url(#codeDrop)" />
      </g>
    </svg>
  );
}
