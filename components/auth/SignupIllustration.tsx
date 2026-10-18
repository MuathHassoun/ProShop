// components/auth/SignupIllustration.tsx
// Original flat illustration: a group of friends taking a selfie.

const Y = '#fdc62b';
const Y_DARK = '#e3b02a';
const INK = '#2b3236';

export default function SignupIllustration() {
  return (
    <svg viewBox="0 0 780 560" className="h-auto w-full" role="img" aria-label="Friends taking a selfie">
      {/* window with skyline */}
      <rect x="70" y="30" width="560" height="200" fill="#d9d9d9" />
      <rect x="80" y="40" width="270" height="180" fill="#ececec" />
      <rect x="360" y="40" width="260" height="180" fill="#ececec" />
      <g fill="#f8f8f8">
        <rect x="100" y="110" width="40" height="110" />
        <rect x="150" y="80" width="38" height="140" />
        <rect x="200" y="125" width="34" height="95" />
        <rect x="250" y="95" width="44" height="125" />
        <rect x="305" y="140" width="40" height="80" />
        <rect x="380" y="120" width="36" height="100" />
        <rect x="430" y="70" width="42" height="150" />
        <rect x="486" y="105" width="38" height="115" />
        <rect x="540" y="130" width="40" height="90" />
        <rect x="585" y="95" width="30" height="125" />
      </g>

      {/* floor + shadow */}
      <line x1="30" y1="450" x2="700" y2="450" stroke="#666" strokeWidth="1" />
      <ellipse cx="365" cy="478" rx="300" ry="22" fill="#ebebeb" />

      {/* speech bubble */}
      <path d="M545 62c0-22 22-36 52-36s52 14 52 36-22 40-52 40c-10 0-19-2-27-5l-27 14 8-24c-4-6-6-14-6-25z" fill={Y} />
      <circle cx="580" cy="66" r="5" fill={INK} />
      <circle cx="600" cy="66" r="5" fill={INK} />
      <circle cx="620" cy="66" r="5" fill={INK} />

      {/* person 4: selfie taker (back right) */}
      <g>
        <path d="M470 450c0-90 20-170 80-185l60 20c30 50 30 120 20 165z" fill={Y} />
        <path d="M505 285c40 30 110 20 160-30l25 55c-40 55-120 80-190 40z" fill={Y_DARK} />
        {/* raised waving arm */}
        <path d="M455 200c-20-40-35-80-30-130l40-5c0 40 20 80 50 100z" fill={Y} />
        <rect x="428" y="35" width="14" height="48" rx="7" fill="#fbb4a5" transform="rotate(-10 435 60)" />
        <rect x="446" y="28" width="14" height="52" rx="7" fill="#fbb4a5" />
        <rect x="464" y="34" width="14" height="48" rx="7" fill="#fbb4a5" transform="rotate(10 470 60)" />
        <rect x="425" y="60" width="62" height="64" rx="26" fill="#fbb4a5" />
        {/* head */}
        <rect x="538" y="170" width="70" height="100" rx="30" fill="#e3705a" />
        <ellipse cx="573" cy="215" rx="30" ry="36" fill="#fbb4a5" />
        <path d="M538 205c0-40 70-50 70 0-20-18-50-18-70 0z" fill={Y} />
        <rect x="533" y="168" width="80" height="30" rx="14" fill={Y} />
        <circle cx="560" cy="218" r="2.5" fill={INK} />
        <circle cx="587" cy="218" r="2.5" fill={INK} />
        <path d="M562 234q12 9 24 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* phone + hand */}
        <rect x="660" y="120" width="52" height="82" rx="8" fill="#3b464c" transform="rotate(25 686 160)" />
        <ellipse cx="655" cy="210" rx="30" ry="22" fill="#fbb4a5" />
      </g>

      {/* person 1: left, grey shirt */}
      <g>
        <path d="M160 450c-10-80 10-150 70-165l60 10c30 40 35 110 20 155z" fill="#c9c9c9" />
        <ellipse cx="258" cy="215" rx="42" ry="50" fill="#f9a99b" />
        <path d="M216 205c-6-50 20-70 55-66 30 3 40 30 30 60-12-20-30-28-55-24-12 2-22 10-30 30z" fill={INK} />
        <circle cx="245" cy="218" r="2.5" fill={INK} />
        <circle cx="275" cy="218" r="2.5" fill={INK} />
        <path d="M247 236q12 10 26 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M190 330c-20 40-50 85-60 110l60 5 40-55z" fill="#f9a99b" />
        <path d="M190 450h120v-30h-100z" fill="#4a5a63" opacity="0.85" />
      </g>

      {/* person 2: braid, yellow top */}
      <g>
        <path d="M262 450c-10-60 5-110 55-120l50 10c25 30 25 80 10 110z" fill={Y} />
        <ellipse cx="335" cy="285" rx="38" ry="44" fill="#d87c63" />
        <path d="M296 280c-2-40 20-60 46-56 26 3 36 24 30 50-10-18-25-22-48-20-10 1-20 10-28 26z" fill={INK} />
        <path d="M300 300c-30 40-35 90-10 130 20-30 15-70 30-95z" fill={INK} />
        <circle cx="322" cy="288" r="2.3" fill={INK} />
        <circle cx="350" cy="288" r="2.3" fill={INK} />
        <path d="M324 304q10 8 22 0" stroke={INK} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      </g>

      {/* person 3: glasses, dark tee, front */}
      <g>
        <path d="M385 450c-5-70 5-115 55-125l60 12c20 30 22 80 12 113z" fill="#4a5a63" />
        <path d="M425 330c60-10 120 40 150 120l-120 0c-20-30-30-70-30-120z" fill="#c9705f" opacity="0" />
        <ellipse cx="455" cy="270" rx="38" ry="44" fill="#8a4a3a" />
        <path d="M418 262c-2-40 22-58 42-56 24 2 34 24 30 48-8-14-22-20-36-20-14 0-28 10-36 28z" fill={INK} />
        <circle cx="443" cy="272" r="9" fill="none" stroke={Y} strokeWidth="2.5" />
        <circle cx="470" cy="272" r="9" fill="none" stroke={Y} strokeWidth="2.5" />
        <line x1="452" y1="272" x2="461" y2="272" stroke={Y} strokeWidth="2.5" />
        <circle cx="443" cy="272" r="2" fill={INK} />
        <circle cx="470" cy="272" r="2" fill={INK} />
        <path d="M446 292q10 7 20 0" stroke={INK} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      </g>

      {/* front arms resting on the table + peace sign */}
      <path d="M255 445c20-40 70-70 130-60 40 8 70 20 100 15l140-10c40 0 60 30 40 55l-30 15z" fill="#c9705f" />
      <path d="M520 360c10-40 40-70 80-60l20 40c-10 30-40 50-70 45z" fill="#a85a4b" />
      <rect x="560" y="268" width="20" height="62" rx="10" fill="#a85a4b" transform="rotate(-12 570 300)" />
      <rect x="585" y="272" width="20" height="62" rx="10" fill="#a85a4b" transform="rotate(14 595 300)" />
      <path d="M330 388c25-20 60-25 85-15l-5 40c-30 10-60 5-80-8z" fill="#c9705f" />

      {/* vase with flowers */}
      <path d="M45 355c-5-25-2-40 6-52" stroke="#3b464c" strokeWidth="3" fill="none" />
      <path d="M56 362c4-25 12-40 26-52" stroke="#3b464c" strokeWidth="3" fill="none" />
      <path d="M52 303c-15-4-24-14-24-26 14 2 25 8 30 18zm34 7c10-8 22-12 32-10-2 12-14 20-30 22z" fill={Y} />
      <path d="M32 290c-6-14-4-28 6-36 8 10 8 24 2 36z" fill={Y_DARK} />
      <path d="M40 360h46l-8 85H46z" fill={Y} />

      {/* cups */}
      <g>
        <path d="M95 435h115c4 28-10 48-55 48s-60-20-60-48z" fill={Y} />
        <ellipse cx="152" cy="435" rx="58" ry="8" fill={Y_DARK} />
        <path d="M95 442c-25-4-25 30 8 32" stroke={Y} strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="130" cy="458" r="4" fill={Y_DARK} />
        <circle cx="160" cy="468" r="4" fill={Y_DARK} />
        <circle cx="180" cy="450" r="4" fill={Y_DARK} />
      </g>
      <g>
        <path d="M600 428h88c0 30-12 54-45 54s-43-24-43-54z" fill="#4a5a63" />
        <ellipse cx="644" cy="428" rx="44" ry="6" fill="#3b464c" />
        <path d="M600 436c-26-4-24 30 6 32" stroke="#4a5a63" strokeWidth="8" fill="none" strokeLinecap="round" />
        <line x1="610" y1="450" x2="680" y2="450" stroke="#3b464c" strokeWidth="2" />
        <line x1="612" y1="462" x2="675" y2="462" stroke="#3b464c" strokeWidth="2" />
      </g>
    </svg>
  );
}
