import { useEffect, useMemo, useState } from 'react';
import { PREVIEW, nuiCallback } from './bridge';

type Screen =
  | 'hud'
  | 'phone'
  | 'inventory'
  | 'wheel'
  | 'pause'
  | 'dialog'
  | 'radio'
  | 'garage'
  | 'race'
  | 'admin';

const NAV: { id: Screen; label: string }[] = [
  { id: 'hud', label: 'HUD' },
  { id: 'phone', label: 'Telefon' },
  { id: 'inventory', label: 'Envanter' },
  { id: 'wheel', label: 'Hızlı seçim' },
  { id: 'pause', label: 'Duraklat / Harita' },
  { id: 'dialog', label: 'NPC' },
  { id: 'radio', label: 'Radyo' },
  { id: 'garage', label: 'Garaj' },
  { id: 'race', label: 'Yarış' },
  { id: 'admin', label: 'Admin' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('hud');
  const [reduce, setReduce] = useState(false);
  const [sound, setSound] = useState(true);
  const [inVehicle, setInVehicle] = useState(true);
  const [heading, setHeading] = useState(18);
  const [cashDelta, setCashDelta] = useState('+₺2.400');
  const [phoneApp, setPhoneApp] = useState<'lock' | 'home' | 'sms' | 'bank' | 'nav' | 'garage'>('home');
  const [pauseTab, setPauseTab] = useState<'map' | 'quests' | 'settings' | 'help'>('map');
  const [wheel, setWheel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Pistol');

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data;
      if (!m || m.v !== 1) return;
      if (m.type === 'hud:snapshot') {
        /* live payload */
      }
      if (m.type === 'ui:open') setScreen(m.payload as Screen);
    };
    window.addEventListener('message', onMsg);
    if (PREVIEW) {
      const t = setInterval(() => setHeading((h) => (h + 2) % 360), 900);
      return () => {
        window.removeEventListener('message', onMsg);
        clearInterval(t);
      };
    }
    nuiCallback('nuiReady', { v: 1 });
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setScreen('hud');
        nuiCallback('close', {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dirs = useMemo(() => {
    const labels = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    const i = Math.round(heading / 45) % 8;
    return { here: labels[i], all: labels };
  }, [heading]);

  return (
    <div className={`app ${reduce ? 'reduce-motion' : ''}`}>
      <header className="topbar">
        <span className="brand">liveBase</span>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={screen === n.id ? 'active' : ''} onClick={() => setScreen(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
        <label style={{ marginLeft: 'auto', fontSize: 12 }}>
          <input type="checkbox" checked={inVehicle} onChange={(e) => setInVehicle(e.target.checked)} /> Araç
        </label>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={reduce} onChange={(e) => setReduce(e.target.checked)} /> Azaltılmış hareket
        </label>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> UI ses
        </label>
      </header>
      <div className="stage day">
        {PREVIEW && <div className="preview-note">Önizleme · mock veri · FiveM NUI hazır</div>}
        <Hud dirs={dirs} inVehicle={inVehicle} cashDelta={cashDelta} />
        {screen === 'phone' && <Phone app={phoneApp} setApp={setPhoneApp} />}
        {screen === 'inventory' && (
          <Inventory
            busy={busy}
            selected={selectedItem}
            onSelect={setSelectedItem}
            onUse={async () => {
              if (busy) return;
              setBusy(true);
              const r = await nuiCallback<{ ok: boolean }>('inventory:use', { item: selectedItem });
              setBusy(false);
              if (!r.ok) setCashDelta('İşlem reddedildi');
            }}
          />
        )}
        {screen === 'wheel' && <Wheel sel={wheel} setSel={setWheel} />}
        {screen === 'pause' && <Pause tab={pauseTab} setTab={setPauseTab} reduce={reduce} setReduce={setReduce} />}
        {screen === 'dialog' && <Dialog />}
        {screen === 'radio' && <Radio />}
        {screen === 'garage' && <Garage />}
        {screen === 'race' && <Race />}
        {screen === 'admin' && <Admin />}
        {screen === 'hud' && (
          <>
            <div className="hotbar">
              {['1 Tabanca', '2 Bandaj', '3 Su', '4 Telefon', '5'].map((s) => (
                <div className="slot" key={s}>
                  {s}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Hud({
  dirs,
  inVehicle,
  cashDelta,
}: {
  dirs: { here: string; all: string[] };
  inVehicle: boolean;
  cashDelta: string;
}) {
  return (
    <div className="hud">
      <div className="compass">
        {dirs.all.map((d) => (
          <span key={d} className={d === dirs.here ? 'here' : ''}>
            {d}
          </span>
        ))}
      </div>
      <div className="street">Boulevard Del Perro · Vespucci</div>
      <div className="quest-chip">
        Liman teslimatı
        <small>Adım 2/4 · Depo kapısına git · 420 m</small>
      </div>
      <div className="minimap">
        <div className="blip" />
        <div className="player" />
      </div>
      <div className="voice">
        <span className="dot talk" /> Konuşuyor · CH 2 · Normal
      </div>
      <div className="status-stack">
        <Stat label="Can" value={78} cls="crit" />
        <Stat label="Zırh" value={40} cls="armor" />
        <Stat label="Dayanıklılık" value={62} cls="stamina" />
        <Stat label="Açlık" value={55} cls="hunger" />
        <Stat label="Susuzluk" value={33} cls="thirst" />
        <Stat label="Stres" value={18} cls="stress" />
      </div>
      <div className="money-toast">{cashDelta} nakit</div>
      <div className="notif-stack">
        <div className="notif quest">Görev · Yeni hedef işaretlendi</div>
        <div className="notif call">Çağrı · 911 · bekliyor</div>
      </div>
      <div className="interact">
        <span className="kbd">E</span> Konuş · Mehmet Kaptan
      </div>
      {inVehicle && (
        <div className="vehicle-hud">
          <div className="speed tabular">
            94<span>KM/S</span>
          </div>
          <div className="veh-row">
            <span>3. vites</span>
            <span>Yakıt 62%</span>
          </div>
          <div className="veh-row">
            <span>Kemer takılı</span>
            <span className="warn">Motor sıcak</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <div className={`bar ${cls}`}>
        <i style={{ width: `${value}%` }} />
      </div>
      <span className="tabular">{value}</span>
    </div>
  );
}

function Phone({
  app,
  setApp,
}: {
  app: 'lock' | 'home' | 'sms' | 'bank' | 'nav' | 'garage';
  setApp: (a: 'lock' | 'home' | 'sms' | 'bank' | 'nav' | 'garage') => void;
}) {
  return (
    <div className="phone-wrap">
      <div className="phone-notch">
        <i />
      </div>
      <div className="phone-screen">
        <div className="phone-status">
          <span>liveBase</span>
          <span className="tabular">21:14</span>
        </div>
        {app !== 'home' && app !== 'lock' && (
          <button className="phone-back" onClick={() => setApp('home')}>
            ← Uygulamalar
          </button>
        )}
        {app === 'home' && (
          <div className="apps">
            {[
              ['Rehber', '#236E76', 'sms'],
              ['SMS', '#3d8b6e', 'sms'],
              ['Banka', '#E9A94B', 'bank'],
              ['Harita', '#DE6657', 'nav'],
              ['Garaj', '#236E76', 'garage'],
              ['Kamera', '#4a5568', 'home'],
              ['İlanlar', '#8b6914', 'home'],
              ['112', '#DE6657', 'sms'],
            ].map(([n, c, a]) => (
              <button key={n} className="app-icon" onClick={() => setApp(a as typeof app)}>
                <span className="tile" style={{ background: c as string }}>
                  {n[0]}
                </span>
                {n}
              </button>
            ))}
          </div>
        )}
        {app === 'sms' && (
          <div>
            <div className="msg">Ada: Konum attım, gel.</div>
            <div className="msg me">Yoldayım.</div>
            <button className="list-item" onClick={() => setApp('nav')}>
              Konum kartı · Vespucci İskelesi → Rota
            </button>
          </div>
        )}
        {app === 'bank' && (
          <div style={{ padding: 16 }}>
            <div className="tabular" style={{ fontSize: 28 }}>
              ₺128.450
            </div>
            <small>liveBase Bank · IBAN gizli</small>
            <button className="list-item">Fatura öde · ₺1.200</button>
          </div>
        )}
        {app === 'nav' && (
          <div style={{ padding: 16, fontSize: 13 }}>
            Rota: Vespucci İskelesi
            <br />
            1.2 km · 3 dk
            <br />
            HUD güncellenir · ESC temizler
          </div>
        )}
        {app === 'garage' && (
          <div>
            <button className="list-item">Blista · Pillbox · hasar %12</button>
            <button className="list-item">Sultan RS · Valet çağır</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Inventory({
  selected,
  onSelect,
  onUse,
  busy,
}: {
  selected: string;
  onSelect: (s: string) => void;
  onUse: () => void;
  busy: boolean;
}) {
  const items = [
    { name: 'Pistol', c: 2, r: 1, w: 2, h: 1, q: 1 },
    { name: 'Su', c: 4, r: 3, w: 1, h: 1, q: 4 },
    { name: 'Bandaj', c: 0, r: 0, w: 2, h: 1, q: 3 },
  ];
  return (
    <div className="inv">
      <div>
        <div style={{ padding: '12px 16px', fontSize: 13 }}>Tetris envanter · 32/40 kg · döndür R</div>
        <div className="grid" style={{ position: 'relative' }}>
          {Array.from({ length: 64 }).map((_, i) => (
            <div className="cell" key={i} />
          ))}
          {items.map((it) => (
            <button
              key={it.name}
              className="item"
              style={{
                position: 'absolute',
                left: 16 + it.c * 52,
                top: 16 + it.r * 52,
                width: it.w * 48 + (it.w - 1) * 4,
                height: it.h * 48 + (it.h - 1) * 4,
              }}
              onClick={() => onSelect(it.name)}
            >
              {it.name}
              <span className="qty">{it.q}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="details">
        <h3>{selected}</h3>
        <p className="weight">Ağırlık 1.2 kg · yasal</p>
        <p style={{ fontSize: 13 }}>Metadata: seri LB-4412 · dayanıklılık 82%</p>
        <button disabled={busy} onClick={onUse} style={{ marginTop: 12, background: '#236E76', color: '#fff', border: 0, padding: '8px 12px', borderRadius: 8 }}>
          {busy ? 'Bekleniyor…' : 'Kullan'}
        </button>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Çift tıklama kilitli. Sunucu reddederse slot geri yüklenir.</p>
      </div>
    </div>
  );
}

function Wheel({ sel, setSel }: { sel: number; setSel: (n: number) => void }) {
  const items = ['Silah', 'El feneri', 'Radyo', 'Telefon', 'Emote', 'İptal'];
  const pos = [
    [0, -120],
    [104, -60],
    [104, 60],
    [0, 120],
    [-104, 60],
    [-104, -60],
  ];
  return (
    <div className="wheel">
      {items.map((it, i) => (
        <button
          key={it}
          className={`seg ${sel === i ? 'on' : ''}`}
          style={{ transform: `translate(${pos[i][0]}px, ${pos[i][1]}px)` }}
          onMouseEnter={() => setSel(i)}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

function Pause({
  tab,
  setTab,
  reduce,
  setReduce,
}: {
  tab: 'map' | 'quests' | 'settings' | 'help';
  setTab: (t: 'map' | 'quests' | 'settings' | 'help') => void;
  reduce: boolean;
  setReduce: (v: boolean) => void;
}) {
  return (
    <div className="pause">
      <aside className="pside">
        {(['map', 'quests', 'settings', 'help'] as const).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'map' ? 'Harita' : t === 'quests' ? 'Görev günlüğü' : t === 'settings' ? 'Ayarlar' : 'Yardım'}
          </button>
        ))}
      </aside>
      <div className="pbody">
        {tab === 'map' && (
          <div className="map">
            <div className="poi" style={{ left: '42%', top: '38%' }} />
            <div className="poi" style={{ left: '61%', top: '55%', background: '#DE6657' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 12 }}>POI · Görev hedefi · Rota koy</div>
          </div>
        )}
        {tab === 'quests' && (
          <div>
            <div className="quest-card">
              <strong>Liman teslimatı</strong>
              <div>Ön koşul: tamam · Adım 2/4 · Ödül ₺4.500</div>
              <small>Son diyalog: “Kasayı iskeleye bırak.”</small>
            </div>
            <div className="quest-card">
              <strong>Kaçırılan ipucu</strong>
              <div>Kaptanın defteri okunmadı</div>
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div className="settings">
            <label>
              Azaltılmış hareket
              <input type="checkbox" checked={reduce} onChange={(e) => setReduce(e.target.checked)} />
            </label>
            <label>
              HUD ölçeği
              <input type="range" min={80} max={120} defaultValue={100} />
            </label>
            <label>
              Minimap: sürekli / dinamik / kapalı
              <select defaultValue="dinamik">
                <option>sürekli</option>
                <option>dinamik</option>
                <option>kapalı</option>
              </select>
            </label>
            <label>
              Dil
              <select defaultValue="tr">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        )}
        {tab === 'help' && <p>ESC üst katmanı kapatır. Oyun içi doğrulama FiveM oturumu gerektirir.</p>}
      </div>
    </div>
  );
}

function Dialog() {
  return (
    <div className="dialog">
      <strong>Mehmet Kaptan</strong>
      <p>Kasayı iskeleye bırakırsan payını alırsın. Polis dolaşıyor.</p>
      <div className="choices">
        <button>Kabul et — teslimatı başlat</button>
        <button>Daha fazla anlat</button>
        <button>Vazgeç</button>
      </div>
    </div>
  );
}

function Radio() {
  return (
    <div className="radio">
      <div>İstasyon · liveBase FM</div>
      <small>Yayın: Gece Vespucci · ses 40% · müzik / araç / VOIP ayrı</small>
    </div>
  );
}

function Garage() {
  return (
    <div className="inv" style={{ gridTemplateColumns: '1fr' }}>
      <div style={{ padding: 20 }}>
        <h3>Valet / Garaj</h3>
        <button className="list-item">Blista Compact · Pillbox Hill · uygun</button>
        <button className="list-item">Sultan RS · impound · uygun değil</button>
      </div>
    </div>
  );
}

function Race() {
  return (
    <div className="inv" style={{ gridTemplateColumns: '1fr' }}>
      <div style={{ padding: 20 }}>
        <h3>Yarış lobisi · Vespucci Sprint</h3>
        <p>Kayıt açık · geri sayım 00:12 · tur 1/3</p>
        <p>1. Ada 1:12.4 · 2. Sen —</p>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <div className="inv" style={{ gridTemplateColumns: '1fr' }}>
      <div style={{ padding: 20 }}>
        <h3>Yönetici</h3>
        <p>Yetki sunucuda doğrulanır. Önizlemede eylemler mock reddedilir.</p>
        <button
          onClick={() => nuiCallback('admin:action', { action: 'kick' })}
          style={{ background: '#DE6657', color: '#fff', border: 0, padding: '8px 12px', borderRadius: 8 }}
        >
          Kick (sunucu kontrolü)
        </button>
      </div>
    </div>
  );
}
