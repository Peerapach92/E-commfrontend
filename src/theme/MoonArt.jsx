// Original artwork for the title screen: a pale moon inside a clock face that
// reads midnight, with black brush strands and cyan shards.
const CX = 420;
const CY = 400;
const NUMERALS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

const polar = (r, i, steps) => {
  const a = (i * 2 * Math.PI) / steps;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};

export default function MoonArt() {
  return (
    <svg className="moon-art" viewBox="0 0 800 800" aria-hidden="true">
      <defs>
        <radialGradient id="moonFill" cx="40%" cy="36%" r="72%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e2f7ff" />
          <stop offset="1" stopColor="#86d9f4" />
        </radialGradient>
        <mask id="moonShade">
          <rect width="800" height="800" fill="#fff" />
          <circle cx="510" cy="350" r="318" fill="#000" />
        </mask>
      </defs>

      <g className="ring-slow">
        <circle cx={CX} cy={CY} r="392" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeDasharray="6 14" />
      </g>
      <circle cx={CX} cy={CY} r="366" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />

      <circle cx={CX} cy={CY} r="340" fill="url(#moonFill)" />
      <circle cx={CX} cy={CY} r="340" fill="#0a2fa8" opacity="0.8" mask="url(#moonShade)" />

      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        const [x1, y1] = polar(major ? 296 : 308, i, 60);
        const [x2, y2] = polar(322, i, 60);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06154f" strokeWidth={major ? 4 : 2} strokeOpacity="0.85" />
        );
      })}

      {NUMERALS.map((t, i) => {
        const [x, y] = polar(256, i, 12);
        return (
          <text key={t} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily="'Chakra Petch', Impact, sans-serif" fontWeight="700" fontSize="30" fill="#06154f" fillOpacity="0.8">
            {t}
          </text>
        );
      })}

      {/* hands: midnight */}
      <polygon points={`${CX - 9},${CY + 22} ${CX},${CY - 230} ${CX + 9},${CY + 22}`} fill="#05060d" />
      <polygon points={`${CX - 15},${CY + 22} ${CX},${CY - 150} ${CX + 15},${CY + 22}`} fill="#19b5e6" stroke="#05060d" strokeWidth="4" />
      <circle cx={CX} cy={CY} r="18" fill="#05060d" />
      <circle cx={CX} cy={CY} r="7" fill="#8fe3fb" />

      {/* brush strands */}
      <path d="M 170 -40 C 230 170 190 330 300 500 C 226 330 240 160 150 -40 Z" fill="#05060d" />
      <path d="M 250 -40 C 330 130 300 260 380 380 C 314 250 320 130 232 -40 Z" fill="#05060d" />
      <path d="M 90 -40 C 140 140 90 300 170 430 C 100 300 110 140 60 -40 Z" fill="#05060d" opacity="0.9" />

      {/* cyan shards */}
      <polygon points="600,600 800,540 760,760" fill="#19b5e6" />
      <polygon points="700,420 800,400 790,500" fill="#8fe3fb" />
      <polygon points="520,700 640,660 600,800" fill="#0a3fd0" />
    </svg>
  );
}
