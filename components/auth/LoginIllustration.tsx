// components/auth/LoginIllustration.tsx
// Original flat illustration: a happy person celebrating a successful login.

const Y = '#fdc62b';
const Y_DARK = '#e3b02a';
const INK = '#2b3236';
const PANTS = '#38474d';
const SKIN = '#ee9a84';

export default function LoginIllustration() {
  return (
    <svg viewBox="0 0 640 560" className="h-auto w-full" role="img" aria-label="Person celebrating">
      {/* window + curtain */}
      <rect x="70" y="40" width="170" height="410" fill="#efefef" />
      <rect x="70" y="40" width="170" height="14" fill="#dedede" />
      <g stroke="#e0e0e0" strokeWidth="6">
        <line x1="90" y1="60" x2="90" y2="440" />
        <line x1="112" y1="60" x2="112" y2="440" />
        <line x1="134" y1="60" x2="134" y2="440" />
        <line x1="156" y1="60" x2="156" y2="440" />
      </g>
      <rect x="120" y="150" width="120" height="8" fill="#d9d9d9" />

      {/* moons with faces */}
      <circle cx="400" cy="100" r="62" fill="#d6d6d6" opacity="0.85" />
      <circle cx="385" cy="88" r="7" fill="#9a9a9a" />
      <circle cx="430" cy="88" r="7" fill="#9a9a9a" />
      <path d="M385 115q22 14 44 0" stroke="#bbb" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="540" cy="195" r="48" fill="#e2e2e2" />
      <circle cx="523" cy="205" r="6" fill="#9a9a9a" />
      <circle cx="560" cy="205" r="6" fill="#9a9a9a" />
      <path d="M530 218q10 8 20 0" stroke="#bbb" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* cabinet */}
      <rect x="470" y="330" width="190" height="125" fill="#dadada" />
      <rect x="470" y="322" width="190" height="10" fill="#ececec" />
      <rect x="485" y="345" width="105" height="48" fill="#e6e6e6" stroke="#d0d0d0" />
      <rect x="485" y="400" width="105" height="48" fill="#e6e6e6" stroke="#d0d0d0" />
      <rect x="520" y="365" width="30" height="8" fill="#c4c4c4" />
      <rect x="520" y="420" width="30" height="8" fill="#c4c4c4" />

      {/* floor + shadow */}
      <line x1="40" y1="455" x2="640" y2="455" stroke="#666" strokeWidth="1" />
      <ellipse cx="340" cy="515" rx="140" ry="22" fill="#ebebeb" />

      {/* plant */}
      <g>
        <path d="M95 410c-40-50-45-100-5-140 30 40 35 90 5 140z" fill={Y} />
        <path d="M110 410c-5-60 20-110 70-135 20 50 0 100-70 135z" fill={Y_DARK} />
        <path d="M100 400c-20-40-35-90-10-125" stroke={INK} strokeWidth="2" fill="none" />
        <path d="M112 395c20-40 35-80 60-110" stroke={INK} strokeWidth="2" fill="none" />
        <path d="M78 405h60l-6 55H84z" fill="#4a5a63" />
        <rect x="74" y="400" width="68" height="12" fill="#2f3b41" />
      </g>

      {/* sparkles */}
      <g fill={Y}>
        <path d="M305 210l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M455 150l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M515 275l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M355 290l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
        <circle cx="285" cy="150" r="3" />
        <circle cx="490" cy="250" r="3" />
        <circle cx="330" cy="125" r="2.5" />
        <circle cx="500" cy="320" r="2.5" />
      </g>

      {/* person: back leg (kicked up) */}
      <path d="M385 285l95 55-45 38-95-70z" fill={PANTS} />
      <path d="M470 328l70-50 36 24-60 62z" fill={Y} />
      <path d="M470 330l62-52" stroke="#fff" strokeWidth="4" opacity="0.7" />

      {/* standing leg */}
      <path d="M298 290l-62 150 72 18 12-40 70-150z" fill={PANTS} />

      {/* shoe standing */}
      <path d="M232 442c-20 10-28 28-20 52l100 30 26-48-26-6-12 20z" fill={Y} />

      {/* torso */}
      <path d="M300 215l60-6 40 80-100 30z" fill="#fff" />
      <path d="M290 215l-40 30 20 70 50-10z" fill={Y_DARK} />
      <path d="M360 210l50 18 15 60-45 10z" fill={Y} />

      {/* arms */}
      <path d="M290 215c-30-20-70-45-95-90l24-22c30 40 60 62 85 80z" fill={Y} />
      <path d="M360 215c30-10 55-40 70-80l32 10c-15 50-45 85-90 100z" fill={Y} />
      {/* hands (fists) */}
      <rect x="170" y="62" width="62" height="64" rx="26" fill={SKIN} transform="rotate(-20 200 95)" />
      <path d="M190 80c8-10 16-12 24-6M202 72c8-10 16-12 24-6" stroke={INK} strokeWidth="2" fill="none" />
      <rect x="418" y="108" width="62" height="64" rx="26" fill={SKIN} transform="rotate(20 450 140)" />

      {/* head */}
      <rect x="330" y="150" width="46" height="70" rx="18" fill={SKIN} />
      <ellipse cx="342" cy="150" rx="40" ry="46" fill={SKIN} />
      <path d="M300 140c-4-34 18-52 44-50 26 2 38 22 34 44-10-12-24-18-40-16-16 2-30 8-38 22z" fill="#a8a8a8" />
      <circle cx="326" cy="152" r="14" fill="none" stroke={INK} strokeWidth="2.2" />
      <circle cx="358" cy="152" r="14" fill="none" stroke={INK} strokeWidth="2.2" />
      <line x1="340" y1="152" x2="344" y2="152" stroke={INK} strokeWidth="2.2" />
      <circle cx="326" cy="153" r="2.3" fill={INK} />
      <circle cx="358" cy="153" r="2.3" fill={INK} />
      <ellipse cx="342" cy="180" rx="9" ry="7" fill={INK} />
    </svg>
  );
}
