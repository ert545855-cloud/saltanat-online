"use strict";
// ═══════════════════════════════════════════════════════
// SALTANAT ONLINE DESIGN TOKENS — v12 "Ottoman AAA — Unified"
// Tek kaynak: bu dosya ile css/styles.css:root aynı paleti kullanır.
// Palette: #1A0E00 bg (warm espresso-black) · #2D1800 surface · #C89B3C gold
//          #F5EBD7 text · #A9A6A0 muted · #4C9A6B success · #C2453D error
// ═══════════════════════════════════════════════════════
const DS = {
  bg:         '#1A0E00',
  bgDeep:     '#120A00',
  surface:    '#2D1800',
  surfaceUp:  '#3D2200',
  surfaceHi:  '#4A2800',

  gold:       '#C89B3C',
  goldDim:    'rgba(200,155,60,0.14)',
  goldBorder: 'rgba(200,155,60,0.35)',
  goldDark:   '#A07828',
  goldLight:  '#E8C06A',

  text:       '#F5EBD7',
  muted:      '#A9A6A0',
  dim:        '#7D7872',

  success:    '#4C9A6B',
  successDim: 'rgba(76,154,107,0.14)',
  error:      '#C2453D',
  errorDim:   'rgba(194,69,61,0.16)',
  violet:     '#9B7BFF',
  violetDim:  'rgba(155,123,255,0.16)',

  border:     'rgba(200,155,60,0.15)',
  borderMid:  'rgba(200,155,60,0.28)',

  radius:     '16px',
  radiusSm:   '10px',
  radiusLg:   '22px',
  radiusPill: '999px',

  // Elevation — premium layered shadows, use for cards/modals/panels
  shadowSm:   '0 2px 10px rgba(0,0,0,0.3)',
  shadowMd:   '0 8px 28px rgba(0,0,0,0.45)',
  shadowLg:   '0 24px 64px rgba(0,0,0,0.65)',
  shadowGold: '0 4px 20px rgba(200,155,60,0.25)',

  transFast:  '0.14s cubic-bezier(0.4,0,0.2,1)',
  trans:      '0.2s cubic-bezier(0.4,0,0.2,1)',

  fontTitle:  "'Cinzel', serif",
  fontUI:     "'Inter', sans-serif",
  fontNum:    "'JetBrains Mono', monospace",
};
window.DS = DS;
