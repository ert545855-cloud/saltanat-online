"use strict";
// ═══════════════════════════════════════════════════════
// SALTANAT ONLINE SHARED UI COMPONENTS — Design System v12 (Unified)
// Note: React hooks from app.js global scope at call time
// ═══════════════════════════════════════════════════════

// LedgerValue — rounded pill capsule stat badge (Mayor HUD style)
function LedgerValue({ value, label, prefix='🪙', color, style={} }) {
  var c = color || (window.DS && window.DS.gold) || '#F0B33E';
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1.5px solid ' + c,
      borderRadius: (window.DS&&window.DS.radiusPill)||'999px',
      padding: '0.4rem 0.85rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 0,
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      ...style
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.92rem',
        fontWeight: 800,
        color: c,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      }}>
        {prefix !== false && prefix}{typeof value === 'number' ? value.toLocaleString('tr-TR') : (value != null ? value : '—')}
      </div>
      {label && (
        <div style={{
          fontSize: '0.55rem',
          color: '#8896B8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
          marginTop: '1px',
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
window.LedgerValue = LedgerValue;

// PrimaryButton — gold filled CTA
function PrimaryButton({ children, onClick, disabled=false, style={}, size='md' }) {
  var _h = React.useState(false); var h = _h[0]; var setH = _h[1];
  var _p = React.useState(false); var p = _p[0]; var setP = _p[1];
  var sizes = {
    sm:   { padding:'0.32rem 0.7rem',  fontSize:'0.75rem', minHeight:'30px' },
    md:   { padding:'0.62rem 1.2rem',  fontSize:'0.87rem', minHeight:'40px' },
    lg:   { padding:'0.82rem 1.5rem',  fontSize:'1rem',    minHeight:'48px' },
    full: { padding:'0.7rem 1rem',     fontSize:'0.87rem', minHeight:'42px', width:'100%' },
  };
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false);}}
      onMouseDown={()=>!disabled&&setP(true)} onMouseUp={()=>setP(false)}
      onTouchStart={()=>!disabled&&setP(true)} onTouchEnd={()=>setP(false)}
      style={{
        background: disabled ? 'rgba(240,179,62,0.18)' : p ? 'linear-gradient(180deg,#C98A1F,#B8790F)' : h ? 'linear-gradient(180deg,#FFD873,#F0B33E)' : 'linear-gradient(180deg,#FDCB5D,#F0B33E)',
        color: disabled ? '#8896B8' : '#241505',
        border: '1.5px solid rgba(255,255,255,0.25)',
        borderRadius: (window.DS&&window.DS.radiusPill)||'999px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        transition: 'all 0.14s ease',
        boxShadow: p || disabled ? 'none' : h ? '0 6px 22px rgba(240,179,62,0.55)' : '0 4px 16px rgba(240,179,62,0.35)',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none', position: 'relative', overflow: 'hidden',
        transform: p ? 'scale(0.96)' : 'none',
        letterSpacing: '0.02em',
        ...sizes[size] || sizes.md,
        ...style,
      }}
    >{children}</button>
  );
}
window.PrimaryButton = PrimaryButton;

// SecondaryButton — neutral ghost
function SecondaryButton({ children, onClick, disabled=false, style={}, size='md' }) {
  var _h = React.useState(false); var h = _h[0]; var setH = _h[1];
  var _p = React.useState(false); var p = _p[0]; var setP = _p[1];
  var sizes = {
    sm:   { padding:'0.32rem 0.7rem',  fontSize:'0.75rem', minHeight:'30px' },
    md:   { padding:'0.62rem 1.2rem',  fontSize:'0.87rem', minHeight:'40px' },
    lg:   { padding:'0.82rem 1.5rem',  fontSize:'1rem',    minHeight:'48px' },
    full: { padding:'0.7rem 1rem',     fontSize:'0.87rem', minHeight:'42px', width:'100%' },
  };
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false);}}
      onMouseDown={()=>!disabled&&setP(true)} onMouseUp={()=>setP(false)}
      onTouchStart={()=>!disabled&&setP(true)} onTouchEnd={()=>setP(false)}
      style={{
        background: disabled ? 'transparent' : p ? 'rgba(255,255,255,0.12)' : h ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        color: disabled ? '#8896B8' : '#F2F5FA',
        border: '1px solid ' + (h&&!disabled ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)'),
        borderRadius: (window.DS&&window.DS.radiusPill)||'999px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        transition: 'all 0.14s ease',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none', position: 'relative', overflow: 'hidden',
        transform: p ? 'scale(0.96)' : 'none',
        ...sizes[size] || sizes.md,
        ...style,
      }}
    >{children}</button>
  );
}
window.SecondaryButton = SecondaryButton;

// Card — standard surface tile
function Card({ children, style={}, onClick }) {
  var c = (window.DS) || {};
  return (
    <div
      onClick={onClick}
      style={{
        background: c.surface || '#2D1800',
        border: '1.5px solid ' + (c.border || 'rgba(200,155,60,0.15)'),
        borderRadius: c.radiusLg || '20px',
        boxShadow: (c.shadowMd || '0 8px 28px rgba(0,0,0,0.45)') + ', inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        ...style,
      }}
    >{children}</div>
  );
}
window.Card = Card;

// Input — standard text input, consistent across all forms
function Input({ style={}, ...props }) {
  var c = (window.DS) || {};
  var _f = React.useState(false); var focused = _f[0]; var setFocused = _f[1];
  return (
    <input
      {...props}
      onFocus={(e)=>{ setFocused(true); props.onFocus && props.onFocus(e); }}
      onBlur={(e)=>{ setFocused(false); props.onBlur && props.onBlur(e); }}
      style={{
        width: '100%',
        padding: '0.78rem 1rem',
        borderRadius: c.radiusSm || '10px',
        border: '1px solid ' + (focused ? (c.goldBorder || 'rgba(200,155,60,0.4)') : (c.border || 'rgba(200,155,60,0.15)')),
        background: 'rgba(255,255,255,0.03)',
        color: c.text || '#F5EBD7',
        fontFamily: (c.fontUI) || "'Inter',sans-serif",
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: c.transFast || '0.14s ease',
        boxShadow: focused ? '0 0 0 3px ' + (c.goldDim || 'rgba(200,155,60,0.14)') : 'none',
        ...style,
      }}
    />
  );
}
window.Input = Input;

// Modal — centered overlay panel, consistent across all confirm/edit dialogs
function Modal({ children, onClose, style={}, maxWidth=420 }) {
  var c = (window.DS) || {};
  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1.25rem', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)',
      }}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          background: c.surface || '#2D1800',
          border: '1px solid ' + (c.border || 'rgba(200,155,60,0.15)'),
          borderRadius: c.radiusLg || '20px',
          padding: '1.75rem 1.5rem',
          width: '100%', maxWidth,
          boxShadow: c.shadowLg || '0 24px 64px rgba(0,0,0,0.65)',
          maxHeight: '85dvh', overflowY: 'auto',
          ...style,
        }}
      >{children}</div>
    </div>
  );
}
window.Modal = Modal;

// GoldDivider — thin horizontal separator
function GoldDivider({ style={} }) {
  return <div style={{height:'1px',background:'rgba(240,179,62,0.25)',margin:'0.75rem 0',...style}} />;
}
window.GoldDivider = GoldDivider;

// SectionTitle — Syne uppercase heading (category label above a stat card)
function SectionTitle({ children, style={} }) {
  return (
    <div style={{
      fontFamily:"'Cinzel',serif",
      fontWeight:800,
      fontSize:'0.85rem',
      color:'#F2F5FA',
      textTransform:'none',
      letterSpacing:'0.02em',
      ...style
    }}>{children}</div>
  );
}
window.SectionTitle = SectionTitle;
