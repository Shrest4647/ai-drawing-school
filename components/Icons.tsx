/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CoinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="#FFB347" stroke="#E6A200" strokeWidth="1.5"/>
    <path d="M12 7l-1.5 3h3L12 7zm0 10l1.5-3h-3L12 17zm-5-5l3 1.5v-3L7 12zm10 0l-3 1.5v-3L17 12z" fill="#FFD700"/>
  </svg>
);

export const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF6B6B" stroke="#D43737" strokeWidth="1"/>
  </svg>
);

export const StreakIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C8.686 2 6 4.686 6 8c0 4 6 14 6 14s6-10 6-14c0-3.314-2.686-6-6-6z" fill="url(#flameGradient)" stroke="#E57A00" strokeWidth="1"/>
    <defs>
      <linearGradient id="flameGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8C00"/>
        <stop offset="1" stopColor="#FFA500"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TrophyIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 22V16M8 16H16M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
);

export const LockIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
);

export const PlayIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 5v14l11-7z"/>
    </svg>
);

export const TranslateIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#63C132" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5h8M7 4v2M10.2 4.1 6 12s-1.3 2.1-2.4 2.1-2.4-2-2.4-2"/>
        <path d="m14 18 5-10 5 10M16.5 15.5h5"/>
    </svg>
);

export const RibbonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#9013FE" stroke="#FFFBF2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

export const CatMascot = () => (
    <div className="w-20 h-20" aria-label="Cute cat mascot">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(5, 10)">
          <path d="M 50,90 C 20,90 20,55 25,45 C 30,35 40,35 50,40 C 60,35 70,35 75,45 C 80,55 80,90 50,90 Z" fill="#FFD180"/>
          <path d="M 30,50 A 15 15 0 0 1 20 25 L 35 40 Z" fill="#FFD180" stroke="#E6A200" strokeWidth="2"/>
          <path d="M 70,50 A 15 15 0 0 0 80 25 L 65 40 Z" fill="#FFD180" stroke="#E6A200" strokeWidth="2"/>
          <circle cx="40" cy="60" r="5" fill="#3D3D3D"/>
          <circle cx="60" cy="60" r="5" fill="#3D3D3D"/>
          <path d="M 45 70 Q 50 75 55 70" stroke="#3D3D3D" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="40" cy="59" r="1.5" fill="white"/>
          <circle cx="60" cy="59" r="1.5" fill="white"/>
        </g>
      </svg>
    </div>
  );
