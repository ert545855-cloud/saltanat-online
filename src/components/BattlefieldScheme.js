"use strict";
// ═══════════════════════════════════════════════════════════════════════
// BATTLEFIELD SCHEME — Detaylı Savaş Alanı Şeması
// "17) Beylikler Arası Savaş Sistemi" dokümanına dayanır:
//   birlik taş-kağız-makas dengesi + arazi bonusu + sur seviyesi + komutan
//   yeteneği birlikte hesaplanıp savaş sonucu üretilir.
// Bu bileşen o hesaba giren TÜM değişkenleri tek bir görsel şemada,
// oyunun altın/koyu (Ottoman AAA) tasarım diliyle gösterir.
//
// Kullanım:
//   <BattlefieldScheme war={warObject} report={resolvedReportOrNull} />
//
// `war` şu alanları kabul eder (hepsi opsiyonel — eksikse toplam güçten
// deterministik biçimde türetilir, böylece backend henüz bu alanları
// döndürmese bile bileşen anında çalışır):
//   attacker_beylik, defender_beylik, attacker_power, defender_power,
//   terrain: { name, bonusSide:'attacker'|'defender', bonusPct },
//   wall: { level, max },              // sur/kuşatma seviyesi
//   siege: { wave, maxWave },          // kuşatma dalgası (varsa)
//   units: { attacker:{piyade,suvari,okcu}, defender:{piyade,suvari,okcu} },
//   commanders: { attacker, defender },
//   morale: { attacker, defender }     // 0-100
// ═══════════════════════════════════════════════════════════════════════

function _bfHash(str) {
  var h = 0;
  for (var i = 0; i < (str || '').length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

// Toplam güçten deterministik (rastgele değil, aynı savaş için hep aynı) birlik dağılımı türet
function _deriveUnits(power, seed) {
  var h = _bfHash(seed);
  var pPiyade = 0.42 + ((h % 15) / 100);       // ~%42-56 piyade
  var pSuvari = 0.22 + (((h >> 4) % 12) / 100); // ~%22-34 süvari
  var pOkcu = Math.max(0.12, 1 - pPiyade - pSuvari);
  var total = Math.max(power || 0, 30);
  return {
    piyade: Math.round((total * pPiyade) / 8),
    suvari: Math.round((total * pSuvari) / 14),
    okcu: Math.round((total * pOkcu) / 9),
  };
}

var TERRAIN_PRESETS = [
  { name: 'Dağlık Arazi', bonusSide: 'defender', bonusPct: 15, desc: 'Savunan taraf sur ve piyade savunmasında avantajlı' },
  { name: 'Ova / Düzlük', bonusSide: 'attacker', bonusPct: 10, desc: 'Süvari hareketliliği saldıran tarafı güçlendiriyor' },
  { name: 'Orman Hattı', bonusSide: 'defender', bonusPct: 12, desc: 'Okçu pusu bonusu savunan tarafta' },
  { name: 'Nehir Kenarı', bonusSide: 'defender', bonusPct: 8, desc: 'Geçiş zorluğu saldırıyı yavaşlatıyor' },
];

function BFIcon({ d, size, color, viewBox }) {
  return React.createElement('svg', {
    width: size || 16, height: size || 16, viewBox: viewBox || '0 0 24 24',
    fill: 'none', stroke: color || 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }, React.createElement('path', { d: d }));
}

// Basit sabit ikon path'leri (yalnızca merkez "cephe" sembolü için — assets/icons/*.svg çizgi dili)
var ICONS = {
  kilic: 'M4 20L10.5 13.5 M14 4l6 6-9.5 9.5-3-3L14 4z M5 19l3-3',
};

// Yeni madalyon-kalite rozet asset'leri (assets/badges/*.svg)
var BADGE_SRC = {
  piyade: '/assets/badges/piyade-badge.svg',
  suvari: '/assets/badges/suvari-badge.svg',
  okcu: '/assets/badges/okcu-badge.svg',
  kale: '/assets/badges/kusatma-badge.svg',
  komutan: '/assets/badges/komutan-badge.svg',
  arazi: '/assets/badges/arazi-badge.svg',
};

function BadgeIcon({ type, size }) {
  var s = size || 20;
  return React.createElement('img', {
    src: BADGE_SRC[type], width: s, height: s,
    style: { borderRadius: '50%', flexShrink: 0, display: 'block' },
    alt: type,
  });
}

function UnitRow({ label, badge, count, color, muted }) {
  var pct = Math.min(100, count > 0 ? Math.max(8, Math.log10(count + 1) * 28) : 0);
  return React.createElement('div', { style: { marginBottom: 8 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 } },
      React.createElement(BadgeIcon, { type: badge, size: 22 }),
      React.createElement('span', { style: { fontSize: '0.68rem', color: muted, flex: 1 } }, label),
      React.createElement('span', { style: { fontSize: '0.72rem', fontWeight: 800, color: color, fontFamily: "'JetBrains Mono', monospace" } }, count.toLocaleString('tr-TR')),
    ),
    React.createElement('div', { style: { height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' } },
      React.createElement('div', { style: { height: '100%', width: pct + '%', background: color, borderRadius: 4, transition: 'width .4s' } }),
    ),
  );
}

function BattlefieldScheme(props) {
  var war = props.war || {};
  var report = props.report || null;
  var DS = window.DS || {};
  var gold = DS.gold || '#C9A227';
  var red = '#C24B43';
  var green = '#4C9A6B';
  var text = DS.text || '#EDE7DA';
  var muted = DS.muted || '#8893A1';
  var surface = DS.surface || '#171B25';
  var border = DS.goldBorder || 'rgba(201,162,39,0.25)';

  var attName = war.attacker_beylik || war.attacker || 'Saldıran Beylik';
  var defName = war.defender_beylik || war.defender || 'Savunan Beylik';
  var attPower = Number(war.attacker_power || war.attackerPower || 0);
  var defPower = Number(war.defender_power || war.defenderPower || 0);
  var totalPower = Math.max(attPower + defPower, 1);
  var attShare = Math.round((attPower / totalPower) * 100);
  var defShare = 100 - attShare;

  var units = war.units || { attacker: _deriveUnits(attPower, attName + '-a'), defender: _deriveUnits(defPower, defName + '-d') };
  var terrain = war.terrain || TERRAIN_PRESETS[_bfHash(attName + defName) % TERRAIN_PRESETS.length];
  var wall = war.wall || { level: 1 + (_bfHash(defName) % 5), max: 6 };
  var siege = war.siege || null;
  var commanders = war.commanders || {
    attacker: war.attacker_commander || 'Sancak Beyi ' + attName.slice(0, 1),
    defender: war.defender_commander || 'Kale Muhafızı ' + defName.slice(0, 1),
  };
  var morale = war.morale || {
    attacker: Math.min(96, 55 + (terrain.bonusSide === 'attacker' ? terrain.bonusPct : -6) + (attShare - 50) / 2),
    defender: Math.min(96, 55 + (terrain.bonusSide === 'defender' ? terrain.bonusPct : -6) + (defShare - 50) / 2),
  };

  // Terrain bonus'u güce dahil ederek kazanma ihtimali tahmini
  var adjAtt = attPower * (1 + (terrain.bonusSide === 'attacker' ? terrain.bonusPct / 100 : 0));
  var adjDef = defPower * (1 + (terrain.bonusSide === 'defender' ? terrain.bonusPct / 100 : 0)) * (1 + (wall.level / (wall.max * 3)));
  var winChanceAtt = Math.round((adjAtt / Math.max(adjAtt + adjDef, 1)) * 100);

  var Panel = function (side) {
    var isAtt = side === 'attacker';
    var name = isAtt ? attName : defName;
    var color = isAtt ? red : green;
    var u = isAtt ? units.attacker : units.defender;
    var pow = isAtt ? attPower : defPower;
    var mor = Math.round(isAtt ? morale.attacker : morale.defender);
    return React.createElement('div', {
      style: {
        flex: 1, background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
        border: '1px solid ' + (isAtt ? 'rgba(194,75,67,0.3)' : 'rgba(76,154,107,0.3)'),
        borderRadius: 12, padding: '12px 12px 10px',
      },
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 } },
        React.createElement('span', { style: { fontSize: '0.62rem', color: muted, textTransform: 'uppercase', letterSpacing: 1 } }, isAtt ? '⚔ Saldıran' : '🛡 Savunan'),
      ),
      React.createElement('div', { style: { fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: '0.92rem', color: text, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, name),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: muted, marginBottom: 10 } },
        React.createElement(BadgeIcon, { type: 'komutan', size: 16 }),
        React.createElement('span', null, commanders[side]),
      ),
      React.createElement(UnitRow, { label: 'Piyade', badge: 'piyade', count: u.piyade, color: color, muted: muted }),
      React.createElement(UnitRow, { label: 'Süvari', badge: 'suvari', count: u.suvari, color: color, muted: muted }),
      React.createElement(UnitRow, { label: 'Okçu', badge: 'okcu', count: u.okcu, color: color, muted: muted }),
      !isAtt && React.createElement('div', { style: { marginTop: 10, paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 } },
          React.createElement(BadgeIcon, { type: 'kale', size: 18 }),
          React.createElement('span', { style: { fontSize: '0.66rem', color: muted, flex: 1 } }, 'Sur Seviyesi'),
          React.createElement('span', { style: { fontSize: '0.7rem', fontWeight: 800, color: gold } }, wall.level + '/' + wall.max),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 3 } },
          Array.from({ length: wall.max }).map(function (_, i) {
            return React.createElement('div', {
              key: i,
              style: { flex: 1, height: 6, borderRadius: 3, background: i < wall.level ? gold : 'rgba(255,255,255,0.08)' },
            });
          }),
        ),
        siege && React.createElement('div', { style: { fontSize: '0.62rem', color: red, marginTop: 4 } }, '🔥 Kuşatma dalgası: ' + siege.wave + '/' + siege.maxWave),
      ),
      React.createElement('div', { style: { marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        React.createElement('span', { style: { fontSize: '0.62rem', color: muted } }, 'Moral'),
        React.createElement('span', { style: { fontSize: '0.7rem', fontWeight: 800, color: mor > 60 ? green : mor > 35 ? gold : red } }, mor + '%'),
      ),
      React.createElement('div', { style: { height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 3 } },
        React.createElement('div', { style: { height: '100%', width: mor + '%', background: mor > 60 ? green : mor > 35 ? gold : red, borderRadius: 4 } }),
      ),
      React.createElement('div', { style: { marginTop: 8, fontSize: '0.62rem', color: muted } },
        'Toplam Güç: ',
        React.createElement('b', { style: { color: color } }, pow.toLocaleString('tr-TR')),
      ),
    );
  };

  return React.createElement('div', {
    style: {
      background: 'linear-gradient(180deg,#171b25,#0f1319)',
      border: '1px solid ' + border, borderRadius: 16, padding: 14,
      fontFamily: "'Inter',sans-serif", color: text, position: 'relative', overflow: 'hidden',
    },
  },
    // Arazi rozeti
    React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        margin: '0 auto 12px', padding: '5px 12px', width: 'fit-content',
        background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 999,
      },
    },
      React.createElement(BadgeIcon, { type: 'arazi', size: 18 }),
      React.createElement('span', { style: { fontSize: '0.68rem', color: gold, fontWeight: 700 } }, terrain.name),
      React.createElement('span', { style: { fontSize: '0.62rem', color: muted } }, '· ' + (terrain.bonusSide === 'attacker' ? 'Saldıran' : 'Savunan') + ' +%' + terrain.bonusPct),
    ),

    // Ana savaş alanı: 2 kamp + orta çarpışma hattı
    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'stretch', position: 'relative' } },
      Panel('attacker'),

      // Orta çarpışma göstergesi
      React.createElement('div', { style: { width: 74, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 } },
        React.createElement('div', {
          style: {
            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(201,162,39,0.25), transparent 70%)',
            border: '1.5px solid ' + gold,
          },
        }, React.createElement(BFIcon, { d: ICONS.kilic, size: 20, color: gold })),
        React.createElement('div', { style: { fontSize: '0.6rem', color: muted, textAlign: 'center' } }, 'CEPHE'),
        React.createElement('div', {
          style: { width: 4, flex: 1, minHeight: 40, borderRadius: 2, background: 'repeating-linear-gradient(180deg, ' + red + ' 0 6px, transparent 6px 12px)' },
        }),
      ),

      Panel('defender'),
    ),

    // Güç oranı ibresi
    React.createElement('div', { style: { marginTop: 14 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: muted, marginBottom: 4 } },
        React.createElement('span', null, 'Zafer İhtimali'),
        React.createElement('span', null, winChanceAtt + '% — %' + (100 - winChanceAtt)),
      ),
      React.createElement('div', { style: { height: 10, borderRadius: 6, overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.08)' } },
        React.createElement('div', { style: { width: winChanceAtt + '%', background: 'linear-gradient(90deg,#8a2e29,' + red + ')' } }),
        React.createElement('div', { style: { width: (100 - winChanceAtt) + '%', background: 'linear-gradient(90deg,' + green + ',#2c5c40)' } }),
      ),
    ),

    // Savaş raporu (sonuçlanmışsa)
    report && React.createElement('div', {
      style: { marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' },
    },
      React.createElement('div', { style: { fontFamily: "'Cinzel',serif", fontSize: '0.85rem', color: gold, marginBottom: 8, letterSpacing: 1 } }, '📜 Savaş Raporu'),
      [
        ['Sonuç', report.result, report.won ? green : red],
        ['Saldıran kaybı', report.attackerLoss, red],
        ['Savunan kaybı', report.defenderLoss, green],
        ['Ganimet', report.loot, gold],
      ].map(function (row, i) {
        return React.createElement('div', {
          key: i, style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' },
        },
          React.createElement('span', { style: { color: muted } }, row[0]),
          React.createElement('span', { style: { fontWeight: 700, color: row[2] } }, row[1]),
        );
      }),
    ),
  );
}

window.BattlefieldScheme = BattlefieldScheme;
